import * as THREE from 'three';
import {
	autoResize,
	createRenderer,
	createRenderLoop,
	disposeScene,
	isSmallScreen,
	makeGlowSprite,
	readThemeColors,
	stripUnusedAttributes,
} from './common';

// Neural-lattice hero: a shallow field of glow nodes joined by faint edges
// wherever neighbors drift within reach, so the topology rewires live as the
// physics moves the field. The soft-body feel is kept — sine drift around
// anchors, spring-back, cursor repulsion, click ripple — and edges stretch,
// brighten near the cursor, and snap as nodes move. Rare fuchsia signal
// pulses hop node-to-node along live edges: the one loud element.
//
// The hero copy counter-drifts a few px toward the cursor (the cloud moves
// away), separating the text plane from the background.
//
// The canvas is position: fixed behind the whole page, so the lattice stays
// pinned while content scrolls over it. Pointer physics listen on window
// (the canvas never receives events behind content), the hero copy fades out
// with scroll, and the lattice dims past the hero so section headings that
// sit directly on the page background stay crisp.

const CAMERA_DISTANCE = 60;
const FOV = 50;

const DRIFT_SPEED = 0.22; // rad/s of the sine drift
const MOUSE_RADIUS = 12;
const MOUSE_FORCE = 18;
const CLICK_FORCE = 55;
const IMPULSE_DAMPING = 0.9;
const PARALLAX = 1.6; // world units the cloud shifts opposite the cursor
const TEXT_PARALLAX_PX = 7; // px the hero copy drifts toward the cursor

const LINK_RADIUS = 8.5; // world distance within which two nodes connect
const LINK_ALPHA = 0.3; // edge opacity at zero distance ("almost visible")
const LINK_CURSOR_RADIUS = 14; // edges this close to the cursor brighten
const LINK_CURSOR_BOOST = 1.6;

const PULSE_SPEED = 17; // world units/s a signal travels along an edge
const PULSE_SIZE = 2.6;

const HERO_FADE_SPAN = 0.55; // hero copy fades over this fraction of a viewport
const HERO_SCROLL_LAG = 0.12; // px of downward drift per px scrolled while fading
const CANVAS_DIM_SPAN = 0.9; // lattice dims over this fraction of a viewport
const CANVAS_DIM_TO = 0.55; // resting lattice opacity once content takes over

interface DotLayer {
	points: THREE.Points;
	material: THREE.PointsMaterial;
	anchor: Float32Array;
	pos: Float32Array;
	vel: Float32Array; // impulse velocities (mouse/click), decays to zero
	phase: Float32Array;
	amp: Float32Array;
	attribute: THREE.BufferAttribute;
	count: number;
}

interface Pulse {
	from: number;
	to: number;
	t: number; // 0..1 along the current edge
	cooldown: number; // idle time before respawning
	active: boolean;
}

export function initHeroGraph(canvas: HTMLCanvasElement): () => void {
	const small = isSmallScreen();
	const finePointer = window.matchMedia('(pointer: fine)').matches;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 300);
	camera.position.set(0, 0, CAMERA_DISTANCE);

	const renderer = createRenderer(canvas);
	const stopResize = autoResize(canvas, renderer, camera);

	const colors = readThemeColors();

	// Spread across the whole visible frustum at z = 0, with generous depth
	const rect = canvas.getBoundingClientRect();
	const aspect = rect.width / Math.max(1, rect.height);
	const halfH = Math.tan(((FOV / 2) * Math.PI) / 180) * CAMERA_DISTANCE;
	const bounds = { x: halfH * aspect * 1.05, y: halfH, z: 14 };

	const cloud = new THREE.Group();
	scene.add(cloud);

	const glowTexture = makeGlowSprite();

	function makeLayer(
		count: number,
		size: number,
		opacity: number,
		color: THREE.Color,
		zSpread: number
	): DotLayer {
		const anchor = new Float32Array(count * 3);
		const pos = new Float32Array(count * 3);
		const vel = new Float32Array(count * 3);
		const phase = new Float32Array(count);
		const amp = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			anchor[i * 3] = (Math.random() * 2 - 1) * bounds.x;
			anchor[i * 3 + 1] = (Math.random() * 2 - 1) * bounds.y;
			anchor[i * 3 + 2] = (Math.random() * 2 - 1) * zSpread;
			pos[i * 3] = anchor[i * 3];
			pos[i * 3 + 1] = anchor[i * 3 + 1];
			pos[i * 3 + 2] = anchor[i * 3 + 2];
			phase[i] = Math.random() * Math.PI * 2;
			amp[i] = 0.6 + Math.random() * 1.4;
		}

		const geometry = new THREE.BufferGeometry();
		const attribute = new THREE.BufferAttribute(pos, 3);
		attribute.setUsage(THREE.DynamicDrawUsage);
		geometry.setAttribute('position', attribute);

		// Normal blending: additive would wash out against the light background
		const material = new THREE.PointsMaterial({
			map: glowTexture,
			color,
			size,
			transparent: true,
			opacity,
			sizeAttenuation: true,
			depthWrite: false,
		});

		const points = new THREE.Points(geometry, material);
		points.frustumCulled = false;
		cloud.add(points);

		return { points, material, anchor, pos, vel, phase, amp, attribute, count };
	}

	// The network layer carries the edges; a dim far field adds depth behind it
	const net = makeLayer(small ? 60 : 130, 1.7, 0.5, colors.accent, 6);
	const far = makeLayer(small ? 70 : 160, 1.0, 0.2, colors.inkLo, bounds.z);
	const layers: DotLayer[] = [net, far];

	// --- Edges: rebuilt every frame from node proximity ------------------------
	// LineBasicMaterial has no per-vertex alpha, so a tiny shader fades each
	// edge by its length (and cursor proximity) without occluding the dots.
	const maxEdges = net.count * 4;
	const linkPos = new Float32Array(maxEdges * 6);
	const linkAlpha = new Float32Array(maxEdges * 2);
	const edgePairs = new Int32Array(maxEdges * 2); // node indices per edge
	let edgeCount = 0;

	const linkGeometry = new THREE.BufferGeometry();
	const linkPosAttr = new THREE.BufferAttribute(linkPos, 3);
	const linkAlphaAttr = new THREE.BufferAttribute(linkAlpha, 1);
	linkPosAttr.setUsage(THREE.DynamicDrawUsage);
	linkAlphaAttr.setUsage(THREE.DynamicDrawUsage);
	linkGeometry.setAttribute('position', linkPosAttr);
	linkGeometry.setAttribute('aAlpha', linkAlphaAttr);
	linkGeometry.setDrawRange(0, 0);

	const linkMaterial = new THREE.ShaderMaterial({
		uniforms: { uColor: { value: colors.accent } },
		vertexShader: /* glsl */ `
			attribute float aAlpha;
			varying float vAlpha;
			void main() {
				vAlpha = aAlpha;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform vec3 uColor;
			varying float vAlpha;
			void main() {
				gl_FragColor = vec4(uColor, vAlpha);
			}
		`,
		transparent: true,
		depthWrite: false,
	});

	const links = new THREE.LineSegments(linkGeometry, linkMaterial);
	links.frustumCulled = false;
	cloud.add(links);

	// --- Signal pulses: bright sparks hopping along live edges -----------------
	const pulseCount = small ? 2 : 4;
	const pulses: Pulse[] = Array.from({ length: pulseCount }, (_, i) => ({
		from: 0,
		to: 0,
		t: 0,
		cooldown: 0.5 + i * 0.9, // desynchronized first spawns
		active: false,
	}));

	const pulsePos = new Float32Array(pulseCount * 3);
	const pulseGeometry = new THREE.BufferGeometry();
	const pulseAttr = new THREE.BufferAttribute(pulsePos, 3);
	pulseAttr.setUsage(THREE.DynamicDrawUsage);
	pulseGeometry.setAttribute('position', pulseAttr);

	const pulseMaterial = new THREE.PointsMaterial({
		map: glowTexture,
		color: colors.accent2,
		size: PULSE_SIZE,
		transparent: true,
		opacity: 0.85,
		sizeAttenuation: true,
		depthWrite: false,
	});

	const pulsePoints = new THREE.Points(pulseGeometry, pulseMaterial);
	pulsePoints.frustumCulled = false;
	cloud.add(pulsePoints);

	/** Random edge out of `node`, avoiding an immediate backtrack to `exclude`. */
	function pickNextNode(node: number, exclude: number): number {
		const candidates: number[] = [];
		for (let e = 0; e < edgeCount && candidates.length < 6; e++) {
			const a = edgePairs[e * 2];
			const b = edgePairs[e * 2 + 1];
			if (a === node && b !== exclude) candidates.push(b);
			else if (b === node && a !== exclude) candidates.push(a);
		}
		if (candidates.length === 0) return -1;
		return candidates[Math.floor(Math.random() * candidates.length)];
	}

	// --- Click ripple ring ----------------------------------------------------
	const ringGeometry = stripUnusedAttributes(new THREE.RingGeometry(0.9, 1, 32));
	const ringMaterial = new THREE.MeshBasicMaterial({
		color: colors.accent,
		transparent: true,
		opacity: 0,
		side: THREE.DoubleSide,
		depthWrite: false,
	});
	const ring = new THREE.Mesh(ringGeometry, ringMaterial);
	ring.visible = false;
	scene.add(ring);
	let ringAge = Infinity;

	// --- Pointer handling -------------------------------------------------------
	const raycaster = new THREE.Raycaster();
	const slabPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
	const ndc = new THREE.Vector2();
	const cursorWorld = new THREE.Vector3();
	let cursorActive = false;
	let pointerDownAt: { x: number; y: number } | null = null;
	const parallaxTarget = new THREE.Vector2();

	// Hero copy counter-parallax: the overlay eases toward the cursor while the
	// cloud eases away, so the text reads as the front plane
	const heroContent = canvas
		.closest('[data-hero]')
		?.querySelector<HTMLElement>('[data-hero-content]');
	const textTarget = new THREE.Vector2();
	const textOffset = new THREE.Vector2();

	function updateCursorWorld(event: PointerEvent): boolean {
		const bounds = canvas.getBoundingClientRect();
		ndc.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		ndc.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
		if (ndc.x < -1 || ndc.x > 1 || ndc.y < -1 || ndc.y > 1) return false;
		raycaster.setFromCamera(ndc, camera);
		return raycaster.ray.intersectPlane(slabPlane, cursorWorld) !== null;
	}

	const onPointerMove = (event: PointerEvent) => {
		cursorActive = updateCursorWorld(event);
		if (cursorActive) {
			parallaxTarget.set(-ndc.x * PARALLAX, -ndc.y * PARALLAX);
			if (finePointer) {
				textTarget.set(ndc.x * TEXT_PARALLAX_PX, -ndc.y * TEXT_PARALLAX_PX);
			}
		}
	};
	const onPointerLeave = () => {
		cursorActive = false;
		parallaxTarget.set(0, 0);
		textTarget.set(0, 0);
	};
	const onPointerDown = (event: PointerEvent) => {
		pointerDownAt = { x: event.clientX, y: event.clientY };
	};
	const onPointerUp = (event: PointerEvent) => {
		if (!pointerDownAt) return;
		const moved = Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y);
		pointerDownAt = null;
		if (moved > 6) return; // it was a drag, not a click
		if (!updateCursorWorld(event)) return;

		// Ripple impulse radiating from the click point
		for (const layer of layers) {
			for (let i = 0; i < layer.count; i++) {
				const dx = layer.pos[i * 3] - cursorWorld.x;
				const dy = layer.pos[i * 3 + 1] - cursorWorld.y;
				const d = Math.sqrt(dx * dx + dy * dy) + 1e-4;
				const impulse = CLICK_FORCE / (1 + d);
				layer.vel[i * 3] += (dx / d) * impulse;
				layer.vel[i * 3 + 1] += (dy / d) * impulse;
			}
		}
		ring.position.copy(cursorWorld);
		ring.visible = true;
		ringAge = 0;
	};

	// Window-level listeners: the fixed canvas sits behind the page content and
	// never receives pointer events itself, but the lattice should still react
	// wherever the user moves or clicks
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	document.documentElement.addEventListener('pointerleave', onPointerLeave);
	window.addEventListener('pointerdown', onPointerDown, { passive: true });
	window.addEventListener('pointerup', onPointerUp, { passive: true });

	// --- Render loop --------------------------------------------------------------
	let elapsed = 0;

	const loop = createRenderLoop(canvas, (dt) => {
		elapsed += dt;

		// Subtle parallax: cloud eases toward the offset opposite the cursor
		cloud.position.x += (parallaxTarget.x - cloud.position.x) * Math.min(1, dt * 2);
		cloud.position.y += (parallaxTarget.y - cloud.position.y) * Math.min(1, dt * 2);
		// Near-imperceptible sway
		cloud.rotation.z = Math.sin(elapsed * 0.03) * 0.02;

		// Scroll choreography: the lattice stays pinned; the hero copy fades and
		// lags slightly downward as it scrolls out, and the whole canvas settles
		// to a dimmer resting opacity so content sections read over it
		const scrollY = window.scrollY;
		const viewportH = Math.max(1, window.innerHeight);

		const dimT = Math.min(1, scrollY / (viewportH * CANVAS_DIM_SPAN));
		canvas.style.opacity = (1 - (1 - CANVAS_DIM_TO) * dimT).toFixed(3);

		if (heroContent) {
			textOffset.x += (textTarget.x - textOffset.x) * Math.min(1, dt * 2.5);
			textOffset.y += (textTarget.y - textOffset.y) * Math.min(1, dt * 2.5);

			const fadeT = Math.min(1, scrollY / (viewportH * HERO_FADE_SPAN));
			const lagY = scrollY * HERO_SCROLL_LAG * fadeT;
			heroContent.style.opacity = (1 - fadeT).toFixed(3);
			// Fully faded copy must not intercept clicks meant for content below
			heroContent.style.visibility = fadeT >= 1 ? 'hidden' : '';
			heroContent.style.transform = `translate3d(${textOffset.x.toFixed(2)}px, ${(textOffset.y + lagY).toFixed(2)}px, 0)`;
		}

		for (const layer of layers) {
			const { anchor, pos, vel, phase, amp, count } = layer;
			for (let i = 0; i < count; i++) {
				// Gentle sine drift around the anchor
				const driftX = Math.cos(elapsed * DRIFT_SPEED * 0.7 + phase[i] * 1.3) * amp[i];
				const driftY = Math.sin(elapsed * DRIFT_SPEED + phase[i]) * amp[i];

				// Mouse repulsion feeds the impulse velocity
				if (cursorActive) {
					const dx = pos[i * 3] - cursorWorld.x;
					const dy = pos[i * 3 + 1] - cursorWorld.y;
					const d = Math.sqrt(dx * dx + dy * dy);
					if (d < MOUSE_RADIUS && d > 1e-4) {
						const f = (MOUSE_FORCE * (1 - d / MOUSE_RADIUS)) / d;
						vel[i * 3] += dx * f * dt * 60;
						vel[i * 3 + 1] += dy * f * dt * 60;
					}
				}

				vel[i * 3] *= IMPULSE_DAMPING;
				vel[i * 3 + 1] *= IMPULSE_DAMPING;

				// Impulse displacement eases back to zero as velocity decays
				pos[i * 3] += (anchor[i * 3] + driftX - pos[i * 3]) * Math.min(1, dt * 3) + vel[i * 3] * dt;
				pos[i * 3 + 1] +=
					(anchor[i * 3 + 1] + driftY - pos[i * 3 + 1]) * Math.min(1, dt * 3) + vel[i * 3 + 1] * dt;
				pos[i * 3 + 2] = anchor[i * 3 + 2];
			}
			layer.attribute.needsUpdate = true;
		}

		// Rewire edges from current proximity. Brute force over the net layer is
		// ~8k pair checks — cheaper than maintaining a spatial index at this size.
		edgeCount = 0;
		const { pos, count } = net;
		for (let i = 0; i < count && edgeCount < maxEdges; i++) {
			const ix = pos[i * 3];
			const iy = pos[i * 3 + 1];
			const iz = pos[i * 3 + 2];
			for (let j = i + 1; j < count; j++) {
				const dx = pos[j * 3] - ix;
				if (dx > LINK_RADIUS || dx < -LINK_RADIUS) continue;
				const dy = pos[j * 3 + 1] - iy;
				if (dy > LINK_RADIUS || dy < -LINK_RADIUS) continue;
				const dz = pos[j * 3 + 2] - iz;
				const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
				if (d >= LINK_RADIUS) continue;

				// Fade with stretch; brighten when the edge midpoint nears the cursor
				let alpha = (1 - d / LINK_RADIUS) * LINK_ALPHA;
				if (cursorActive) {
					const mx = ix + dx * 0.5 - cursorWorld.x;
					const my = iy + dy * 0.5 - cursorWorld.y;
					const md = Math.sqrt(mx * mx + my * my);
					if (md < LINK_CURSOR_RADIUS) {
						alpha *= 1 + (1 - md / LINK_CURSOR_RADIUS) * LINK_CURSOR_BOOST;
					}
				}

				const v = edgeCount * 6;
				linkPos[v] = ix;
				linkPos[v + 1] = iy;
				linkPos[v + 2] = iz;
				linkPos[v + 3] = pos[j * 3];
				linkPos[v + 4] = pos[j * 3 + 1];
				linkPos[v + 5] = pos[j * 3 + 2];
				linkAlpha[edgeCount * 2] = alpha;
				linkAlpha[edgeCount * 2 + 1] = alpha;
				edgePairs[edgeCount * 2] = i;
				edgePairs[edgeCount * 2 + 1] = j;
				edgeCount++;
				if (edgeCount >= maxEdges) break;
			}
		}
		linkGeometry.setDrawRange(0, edgeCount * 2);
		linkPosAttr.needsUpdate = true;
		linkAlphaAttr.needsUpdate = true;

		// Signal pulses travel their edge, then hop to a connected one
		for (let p = 0; p < pulses.length; p++) {
			const pulse = pulses[p];

			if (!pulse.active) {
				pulse.cooldown -= dt;
				if (pulse.cooldown <= 0 && edgeCount > 0) {
					const e = Math.floor(Math.random() * edgeCount);
					pulse.from = edgePairs[e * 2];
					pulse.to = edgePairs[e * 2 + 1];
					pulse.t = 0;
					pulse.active = true;
				}
			}

			if (pulse.active) {
				const a = pulse.from * 3;
				const b = pulse.to * 3;
				const len = Math.max(
					1,
					Math.hypot(pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2])
				);
				pulse.t += (dt * PULSE_SPEED) / len;

				if (pulse.t >= 1) {
					const next = pickNextNode(pulse.to, pulse.from);
					if (next === -1) {
						// Dead end: the edge web moved on — rest, then respawn elsewhere
						pulse.active = false;
						pulse.cooldown = 0.4 + Math.random() * 1.4;
					} else {
						pulse.from = pulse.to;
						pulse.to = next;
						pulse.t = 0;
					}
				}
			}

			if (pulse.active) {
				const a = pulse.from * 3;
				const b = pulse.to * 3;
				pulsePos[p * 3] = pos[a] + (pos[b] - pos[a]) * pulse.t;
				pulsePos[p * 3 + 1] = pos[a + 1] + (pos[b + 1] - pos[a + 1]) * pulse.t;
				pulsePos[p * 3 + 2] = pos[a + 2] + (pos[b + 2] - pos[a + 2]) * pulse.t;
			} else {
				pulsePos[p * 3 + 2] = -500; // beyond the far plane: clipped, invisible
			}
		}
		pulseAttr.needsUpdate = true;

		// Click ripple
		if (ring.visible) {
			ringAge += dt;
			const t = ringAge / 0.7;
			if (t >= 1) {
				ring.visible = false;
			} else {
				const s = 1 + t * 16;
				ring.scale.set(s, s, s);
				ringMaterial.opacity = 0.35 * (1 - t);
			}
		}

		renderer.render(scene, camera);
	});
	loop.start();

	return () => {
		loop.dispose();
		stopResize();
		window.removeEventListener('pointermove', onPointerMove);
		document.documentElement.removeEventListener('pointerleave', onPointerLeave);
		window.removeEventListener('pointerdown', onPointerDown);
		window.removeEventListener('pointerup', onPointerUp);
		canvas.style.opacity = '';
		if (heroContent) {
			heroContent.style.transform = '';
			heroContent.style.opacity = '';
			heroContent.style.visibility = '';
		}
		glowTexture.dispose();
		disposeScene(scene, renderer);
	};
}
