import * as THREE from 'three';

export interface SceneColors {
	accent: THREE.Color;
	accent2: THREE.Color;
	inkLo: THREE.Color;
	surface: THREE.Color;
	base: THREE.Color;
}

/**
 * Reads the semantic design tokens off :root so scenes always match the
 * site palette without hard-coding colors.
 */
export function readThemeColors(): SceneColors {
	const style = getComputedStyle(document.documentElement);
	const read = (name: string, fallback: string) => {
		const value = style.getPropertyValue(name).trim();
		return new THREE.Color(value || fallback);
	};
	return {
		accent: read('--accent', '#3c69e7'),
		accent2: read('--accent-2', '#d61c4e'),
		inkLo: read('--text-lo', '#64708c'),
		surface: read('--bg-surface', '#ffffff'),
		base: read('--bg-base', '#f6f8fc'),
	};
}

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isSmallScreen(): boolean {
	return window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Transparent-clear renderer tuned for decorative background scenes:
 * - antialias OFF: MSAA multiplies framebuffer memory ~4x and soft glow
 *   sprites / tiny dots gain nothing from it
 * - DPR clamped to 1.5 (1.25 mobile): halves-to-quarters the backing store
 *   vs a DPR-2 retina buffer with no visible loss on soft shapes
 * - low-power: prefer the integrated GPU on dual-GPU machines
 */
export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: false,
		alpha: true,
		powerPreference: 'low-power',
	});
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen() ? 1.25 : 1.5));
	return renderer;
}

/**
 * Drops vertex attributes that MeshBasicMaterial never reads (normals, UVs on
 * untextured meshes) — typically halves a geometry's vertex memory.
 */
export function stripUnusedAttributes(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
	geometry.deleteAttribute('normal');
	geometry.deleteAttribute('uv');
	return geometry;
}

export interface RenderLoop {
	start(): void;
	dispose(): void;
}

/**
 * rAF loop that pauses when the tab is hidden or the canvas scrolls offscreen.
 * `render` receives the frame delta in seconds, clamped to 33ms.
 */
export function createRenderLoop(
	canvas: HTMLCanvasElement,
	render: (dt: number) => void
): RenderLoop {
	let rafId = 0;
	let running = false;
	let visible = true;
	let inView = true;
	let lastTime = 0;

	const tick = (time: number) => {
		if (!running) return;
		const dt = Math.min((time - lastTime) / 1000, 0.033);
		lastTime = time;
		render(dt);
		rafId = requestAnimationFrame(tick);
	};

	const resume = () => {
		if (running || !visible || !inView) return;
		running = true;
		lastTime = performance.now();
		rafId = requestAnimationFrame(tick);
	};

	const pause = () => {
		running = false;
		cancelAnimationFrame(rafId);
	};

	const onVisibility = () => {
		visible = document.visibilityState === 'visible';
		visible ? resume() : pause();
	};

	const observer = new IntersectionObserver(
		(entries) => {
			inView = entries[0]?.isIntersecting ?? true;
			inView ? resume() : pause();
		},
		{ threshold: 0 }
	);

	document.addEventListener('visibilitychange', onVisibility);
	observer.observe(canvas);

	return {
		start: resume,
		dispose() {
			pause();
			document.removeEventListener('visibilitychange', onVisibility);
			observer.disconnect();
		},
	};
}

/** Radial-gradient sprite texture — cheap additive glow, no post-processing. */
export function makeGlowSprite(): THREE.CanvasTexture {
	const size = 64;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	gradient.addColorStop(0, 'rgba(255,255,255,1)');
	gradient.addColorStop(0.3, 'rgba(255,255,255,0.45)');
	gradient.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);
	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;
	return texture;
}

export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
	scene.traverse((obj) => {
		const mesh = obj as THREE.Mesh;
		if (mesh.geometry) mesh.geometry.dispose();
		const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
		if (Array.isArray(material)) {
			material.forEach((m) => disposeMaterial(m));
		} else if (material) {
			disposeMaterial(material);
		}
	});
	renderer.dispose();
}

function disposeMaterial(material: THREE.Material): void {
	const withMap = material as THREE.Material & { map?: THREE.Texture | null };
	withMap.map?.dispose();
	material.dispose();
}

/**
 * Keeps renderer + camera in sync with the canvas's CSS size (observes the
 * canvas's parent). Returns a cleanup function.
 */
export function autoResize(
	canvas: HTMLCanvasElement,
	renderer: THREE.WebGLRenderer,
	camera: THREE.PerspectiveCamera
): () => void {
	const apply = () => {
		const width = canvas.clientWidth || 1;
		const height = canvas.clientHeight || 1;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	apply();
	const observer = new ResizeObserver(apply);
	observer.observe(canvas);
	return () => observer.disconnect();
}
