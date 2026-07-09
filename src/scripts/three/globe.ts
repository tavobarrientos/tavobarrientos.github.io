import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
	autoResize,
	createRenderer,
	createRenderLoop,
	disposeScene,
	makeGlowSprite,
	readThemeColors,
	stripUnusedAttributes,
} from './common';

const GLOBE_RADIUS = 10;
const DOT_CANDIDATES = 22000;
const MASK_URL = '/images/three/land-mask.png';
// Sample the mask at half resolution: plenty of precision for a dot filter,
// and the transient ImageData drops from ~2MB to ~0.5MB
const MASK_SAMPLE_W = 512;
const MASK_SAMPLE_H = 256;

export interface GlobeOptions {
	lat: number;
	lon: number;
	/** Camera distance from the globe center; smaller = bigger globe. Default 30. */
	distance?: number;
}

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
	const phi = ((90 - lat) * Math.PI) / 180;
	const theta = ((lon + 180) * Math.PI) / 180;
	return new THREE.Vector3(
		-radius * Math.sin(phi) * Math.cos(theta),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta)
	);
}

/** Loads the equirectangular land mask; resolves null on any failure. */
function loadMask(): Promise<ImageData | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				canvas.width = MASK_SAMPLE_W;
				canvas.height = MASK_SAMPLE_H;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, MASK_SAMPLE_W, MASK_SAMPLE_H);
				resolve(ctx.getImageData(0, 0, MASK_SAMPLE_W, MASK_SAMPLE_H));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = MASK_URL;
	});
}

/**
 * Fibonacci-sphere candidates filtered by the land mask (land = dark pixels).
 * Falls back to a uniform dot sphere if the mask is unavailable, so the globe
 * never hard-fails.
 */
function buildDotPositions(mask: ImageData | null): Float32Array {
	// Preallocated typed buffer instead of a growing number[]: no boxed doubles,
	// no reallocation churn during the 22k-candidate sweep
	const buffer = new Float32Array(DOT_CANDIDATES * 3);
	let kept = 0;
	const golden = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < DOT_CANDIDATES; i++) {
		const y = 1 - (i / (DOT_CANDIDATES - 1)) * 2;
		const radiusAtY = Math.sqrt(1 - y * y);
		const theta = golden * i;
		const x = Math.cos(theta) * radiusAtY;
		const z = Math.sin(theta) * radiusAtY;

		if (mask) {
			const lat = (Math.asin(y) * 180) / Math.PI;
			const lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
			const normLon = ((lon + 540) % 360) - 180;
			const px = Math.min(
				mask.width - 1,
				Math.max(0, Math.floor(((normLon + 180) / 360) * mask.width))
			);
			const py = Math.min(
				mask.height - 1,
				Math.max(0, Math.floor(((90 - lat) / 180) * mask.height))
			);
			const value = mask.data[(py * mask.width + px) * 4];
			if (value > 128) continue; // water — skip
		} else if (i % 3 !== 0) {
			continue; // no mask: thinner uniform sphere
		}

		buffer[kept * 3] = x * GLOBE_RADIUS;
		buffer[kept * 3 + 1] = y * GLOBE_RADIUS;
		buffer[kept * 3 + 2] = z * GLOBE_RADIUS;
		kept++;
	}
	// slice() so the oversized candidate buffer is released to GC
	return buffer.slice(0, kept * 3);
}

export function initGlobe(canvas: HTMLCanvasElement, options: GlobeOptions): () => void {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

	const renderer = createRenderer(canvas);
	const stopResize = autoResize(canvas, renderer, camera);

	const colors = readThemeColors();
	const globe = new THREE.Group();
	scene.add(globe);

	// Occluder sphere: hides far-side dots. Tinted with the PAGE background so
	// it is invisible against it — only the dots, pin, and atmosphere show.
	const occluderMaterial = new THREE.MeshBasicMaterial({ color: colors.base });
	const occluder = new THREE.Mesh(
		stripUnusedAttributes(new THREE.SphereGeometry(GLOBE_RADIUS * 0.995, 32, 24)),
		occluderMaterial
	);
	globe.add(occluder);

	// Atmosphere shell (normal blending — additive washes out on light bg)
	const atmosphereMaterial = new THREE.MeshBasicMaterial({
		color: colors.accent,
		transparent: true,
		opacity: 0.06,
		side: THREE.BackSide,
		depthWrite: false,
	});
	const atmosphere = new THREE.Mesh(
		stripUnusedAttributes(new THREE.SphereGeometry(GLOBE_RADIUS * 1.18, 32, 24)),
		atmosphereMaterial
	);
	scene.add(atmosphere);

	// Land dots (built async once the mask loads)
	// Slightly larger dots compensate for the halved candidate count
	const dotsMaterial = new THREE.PointsMaterial({
		color: colors.accent,
		size: 0.1,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.85,
	});
	let dots: THREE.Points | null = null;
	loadMask().then((mask) => {
		if (disposed) return;
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(buildDotPositions(mask), 3));
		dots = new THREE.Points(geometry, dotsMaterial);
		globe.add(dots);
	});

	// --- Location pin --------------------------------------------------------
	const pinGroup = new THREE.Group();
	const surfacePoint = latLonToVec3(options.lat, options.lon, GLOBE_RADIUS);
	const normal = surfacePoint.clone().normalize();

	const pinHeadMaterial = new THREE.MeshBasicMaterial({ color: colors.accent2 });
	const pinHead = new THREE.Mesh(
		stripUnusedAttributes(new THREE.SphereGeometry(0.22, 12, 10)),
		pinHeadMaterial
	);
	pinHead.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS * 1.06));
	pinGroup.add(pinHead);

	const pinStemMaterial = new THREE.MeshBasicMaterial({ color: colors.accent2 });
	const pinStem = new THREE.Mesh(
		stripUnusedAttributes(new THREE.ConeGeometry(0.12, 0.65, 8)),
		pinStemMaterial
	);
	pinStem.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS * 1.028));
	// Cone points +Y by default; aim it inward along the surface normal
	pinStem.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), normal);
	pinGroup.add(pinStem);

	const glowTexture = makeGlowSprite();
	const pinGlowMaterial = new THREE.SpriteMaterial({
		map: glowTexture,
		color: colors.accent2,
		transparent: true,
		opacity: 0.55,
		depthWrite: false,
	});
	const pinGlow = new THREE.Sprite(pinGlowMaterial);
	pinGlow.scale.setScalar(1.6);
	pinGlow.position.copy(pinHead.position);
	pinGroup.add(pinGlow);

	// Pulse rings tangent to the surface
	const ringMaterial = new THREE.MeshBasicMaterial({
		color: colors.accent2,
		transparent: true,
		opacity: 0,
		side: THREE.DoubleSide,
		depthWrite: false,
	});
	const pulseRing = new THREE.Mesh(
		stripUnusedAttributes(new THREE.RingGeometry(0.28, 0.34, 24)),
		ringMaterial
	);
	pulseRing.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS * 1.005));
	pulseRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
	pinGroup.add(pulseRing);

	globe.add(pinGroup);

	// --- Camera & controls ----------------------------------------------------
	// Aim the camera at the pin's longitude/latitude so Monterrey faces the viewer
	const cameraDir = normal.clone();
	camera.position.copy(cameraDir.multiplyScalar(options.distance ?? 30));
	camera.lookAt(0, 0, 0);

	const controls = new OrbitControls(camera, canvas);
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 0.6;

	let resumeTimeout = 0;
	const onControlStart = () => {
		controls.autoRotate = false;
		window.clearTimeout(resumeTimeout);
	};
	const onControlEnd = () => {
		window.clearTimeout(resumeTimeout);
		resumeTimeout = window.setTimeout(() => {
			controls.autoRotate = true;
		}, 2000);
	};
	controls.addEventListener('start', onControlStart);
	controls.addEventListener('end', onControlEnd);

	// --- Render loop --------------------------------------------------------------
	let elapsed = 0;
	let disposed = false;
	const loop = createRenderLoop(canvas, (dt) => {
		elapsed += dt;
		controls.update();

		// Pin pulse: ring expands and fades on a ~1.8s cycle
		const t = (elapsed % 1.8) / 1.8;
		const scale = 1 + t * 5;
		pulseRing.scale.set(scale, scale, scale);
		ringMaterial.opacity = 0.7 * (1 - t);

		renderer.render(scene, camera);
	});
	loop.start();

	return () => {
		disposed = true;
		loop.dispose();
		stopResize();
		window.clearTimeout(resumeTimeout);
		controls.removeEventListener('start', onControlStart);
		controls.removeEventListener('end', onControlEnd);
		controls.dispose();
		glowTexture.dispose();
		disposeScene(scene, renderer);
	};
}
