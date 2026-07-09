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

// Ambient dot-field hero, inspired by countdown.substraterx.com: sparse soft
// glow dots drifting on slow sine waves — no edges, no force simulation.
// Interactivity is kept but subtle: gentle repulsion around the cursor and a
// ripple impulse on click.

const CAMERA_DISTANCE = 60;
const FOV = 50;

const DRIFT_SPEED = 0.22; // rad/s of the sine drift
const MOUSE_RADIUS = 12;
const MOUSE_FORCE = 18;
const CLICK_FORCE = 55;
const IMPULSE_DAMPING = 0.9;
const PARALLAX = 1.6; // world units the cloud shifts opposite the cursor

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

export function initHeroGraph(canvas: HTMLCanvasElement): () => void {
	const small = isSmallScreen();

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
		color: THREE.Color
	): DotLayer {
		const anchor = new Float32Array(count * 3);
		const pos = new Float32Array(count * 3);
		const vel = new Float32Array(count * 3);
		const phase = new Float32Array(count);
		const amp = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			anchor[i * 3] = (Math.random() * 2 - 1) * bounds.x;
			anchor[i * 3 + 1] = (Math.random() * 2 - 1) * bounds.y;
			anchor[i * 3 + 2] = (Math.random() * 2 - 1) * bounds.z;
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
		cloud.add(points);

		return { points, material, anchor, pos, vel, phase, amp, attribute, count };
	}

	// Two depth layers: a dim far field and a slightly stronger near field
	const layers: DotLayer[] = [
		makeLayer(small ? 90 : 220, 1.1, 0.25, colors.accent),
		makeLayer(small ? 40 : 110, 1.9, 0.3, colors.inkLo),
	];

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
		}
	};
	const onPointerLeave = () => {
		cursorActive = false;
		parallaxTarget.set(0, 0);
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

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	canvas.addEventListener('pointerleave', onPointerLeave);
	canvas.addEventListener('pointerdown', onPointerDown);
	canvas.addEventListener('pointerup', onPointerUp);

	// --- Render loop --------------------------------------------------------------
	let elapsed = 0;

	const loop = createRenderLoop(canvas, (dt) => {
		elapsed += dt;

		// Subtle parallax: cloud eases toward the offset opposite the cursor
		cloud.position.x += (parallaxTarget.x - cloud.position.x) * Math.min(1, dt * 2);
		cloud.position.y += (parallaxTarget.y - cloud.position.y) * Math.min(1, dt * 2);
		// Near-imperceptible sway, like the reference's slow rotation
		cloud.rotation.z = Math.sin(elapsed * 0.03) * 0.02;

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
		canvas.removeEventListener('pointerleave', onPointerLeave);
		canvas.removeEventListener('pointerdown', onPointerDown);
		canvas.removeEventListener('pointerup', onPointerUp);
		glowTexture.dispose();
		disposeScene(scene, renderer);
	};
}
