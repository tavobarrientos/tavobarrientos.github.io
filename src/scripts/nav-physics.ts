// Physics for the floating capsule nav (NavBar.astro):
// - a spring-loaded indicator pill that chases the hovered link and settles
//   back on the active one, with a little overshoot
// - an inertial "hang": scroll velocity kicks the capsule, which bobs and
//   tilts on a loose spring like it has mass
// - magnetic icon buttons that lean a few px toward the cursor
//
// One rAF loop integrates every spring and sleeps once everything settles,
// so the nav costs nothing while idle. Mobile menu toggling stays outside
// the reduced-motion guard — it's navigation, not decoration.

interface Spring {
	x: number;
	v: number;
	target: number;
}

const spring = (x = 0): Spring => ({ x, v: 0, target: x });

function step(s: Spring, k: number, c: number, dt: number): void {
	s.v += (-(s.x - s.target) * k - s.v * c) * dt;
	s.x += s.v * dt;
}

function settled(s: Spring): boolean {
	return Math.abs(s.v) < 0.02 && Math.abs(s.x - s.target) < 0.02;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const root = document.querySelector<HTMLElement>('[data-navbar]');
if (root) initNav(root);

function initNav(root: HTMLElement): void {
	// --- Mobile menu (independent of motion preferences) ---------------------
	const button = root.querySelector<HTMLButtonElement>('#mobile-menu-button');
	const menu = root.querySelector<HTMLElement>('#mobile-menu');
	const setMenuOpen = (open: boolean) => {
		if (!button || !menu) return;
		menu.classList.toggle('hidden', !open);
		button.setAttribute('aria-expanded', String(open));
	};
	if (button && menu) {
		button.addEventListener('click', () => setMenuOpen(menu.classList.contains('hidden')));
		document.addEventListener('click', (event) => {
			if (!menu.classList.contains('hidden') && !root.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		});
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') setMenuOpen(false);
		});
	}

	// --- Active-link sync ------------------------------------------------------
	// The HUD bar persists across client-side navigations, so the server never
	// re-renders its active state: recompute it from the URL on every page load.
	const allNavLinks = () =>
		Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-nav-link], [data-nav-mlink]'));

	const matchesPath = (href: string, path: string) =>
		href === path || (href !== '/' && path.startsWith(href));

	function syncActive(): void {
		const path = window.location.pathname;
		for (const link of allNavLinks()) {
			const active = matchesPath(link.getAttribute('href') ?? '', path);
			link.classList.toggle('nav-active', active);
			if (active) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		}
		setMenuOpen(false);
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		document.addEventListener('astro:page-load', syncActive);
		return;
	}

	const capsule = root.querySelector<HTMLElement>('[data-nav-capsule]');
	const linksWrap = root.querySelector<HTMLElement>('[data-nav-links]');
	const indicator = root.querySelector<HTMLElement>('[data-nav-indicator]');
	const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));

	// Integrator state — declared before the first wake() call below (aiming the
	// indicator at the active link wakes the loop during init)
	let running = false;
	let lastTime = 0;

	// --- Indicator: chases hover, returns to the active link -----------------
	// Underdamped (ζ ≈ 0.67) so it overshoots a touch and snaps back
	const IND_K = 380;
	const IND_C = 26;
	const indX = spring();
	const indW = spring();
	let activeLink = links.find((l) => l.hasAttribute('aria-current')) ?? null;
	let indicatorTarget: HTMLElement | null = null;

	function aimIndicator(link: HTMLElement, immediate = false): void {
		indicatorTarget = link;
		// offsetLeft/Width are relative to the position:relative links wrap
		indX.target = link.offsetLeft;
		indW.target = link.offsetWidth;
		if (immediate || indicator!.style.opacity !== '1') {
			indX.x = indX.target;
			indW.x = indW.target;
			indX.v = 0;
			indW.v = 0;
		}
		indicator!.style.opacity = '1';
		wake();
	}

	function restIndicator(): void {
		if (activeLink) {
			aimIndicator(activeLink);
		} else {
			indicatorTarget = null;
			indicator!.style.opacity = '0';
		}
	}

	if (linksWrap && indicator) {
		linksWrap.classList.add('nav-js');
		if (activeLink) aimIndicator(activeLink, true);
		for (const link of links) {
			link.addEventListener('mouseenter', () => aimIndicator(link));
		}
		linksWrap.addEventListener('mouseleave', restIndicator);
		window.addEventListener('resize', () => {
			if (indicatorTarget) aimIndicator(indicatorTarget, true);
		});
	}

	// After each client-side navigation: recompute the active link and glide
	// the indicator over to it
	document.addEventListener('astro:page-load', () => {
		syncActive();
		activeLink = links.find((l) => l.hasAttribute('aria-current')) ?? null;
		restIndicator();
	});

	// --- Inertial hang: scroll velocity kicks the capsule ---------------------
	// Loose spring (ζ ≈ 0.64) so a hard scroll makes it bob twice, not once
	const HANG_K = 120;
	const HANG_C = 14;
	const HANG_KICK = 1.1; // spring velocity per px of scroll delta
	const HANG_MAX = 12; // px the capsule may drift from rest
	const hang = spring();
	let lastScrollY = window.scrollY;

	window.addEventListener(
		'scroll',
		() => {
			const dy = window.scrollY - lastScrollY;
			lastScrollY = window.scrollY;
			// Scrolling down lifts the capsule; it springs back and settles
			hang.v += clamp(dy, -40, 40) * -HANG_KICK;
			wake();
		},
		{ passive: true }
	);

	// --- Magnetic icons -------------------------------------------------------
	const MAG_K = 320;
	const MAG_C = 22;
	const MAG_PULL = 0.35;
	const MAG_MAX = 4; // px
	const magnets = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]')).map((el) => {
		const mx = spring();
		const my = spring();
		el.addEventListener('pointermove', (event) => {
			const rect = el.getBoundingClientRect();
			mx.target = clamp((event.clientX - (rect.left + rect.width / 2)) * MAG_PULL, -MAG_MAX, MAG_MAX);
			my.target = clamp((event.clientY - (rect.top + rect.height / 2)) * MAG_PULL, -MAG_MAX, MAG_MAX);
			wake();
		});
		el.addEventListener('pointerleave', () => {
			mx.target = 0;
			my.target = 0;
			wake();
		});
		return { el, mx, my };
	});

	// --- Shared integrator: runs while anything moves, then sleeps -----------
	function frame(time: number): void {
		const dt = Math.min((time - lastTime) / 1000, 0.033);
		lastTime = time;

		let busy = false;

		if (indicator && indicatorTarget) {
			step(indX, IND_K, IND_C, dt);
			step(indW, IND_K, IND_C, dt);
			indicator.style.transform = `translateX(${indX.x.toFixed(2)}px)`;
			indicator.style.width = `${indW.x.toFixed(2)}px`;
			busy = busy || !settled(indX) || !settled(indW);
		}

		if (capsule) {
			step(hang, HANG_K, HANG_C, dt);
			const y = clamp(hang.x, -HANG_MAX, HANG_MAX);
			capsule.style.transform = `translateY(${y.toFixed(2)}px) rotate(${(y * -0.1).toFixed(3)}deg)`;
			busy = busy || !settled(hang);
		}

		for (const { el, mx, my } of magnets) {
			step(mx, MAG_K, MAG_C, dt);
			step(my, MAG_K, MAG_C, dt);
			el.style.transform = `translate(${mx.x.toFixed(2)}px, ${my.x.toFixed(2)}px)`;
			busy = busy || !settled(mx) || !settled(my);
		}

		if (!busy) {
			running = false;
			return;
		}
		requestAnimationFrame(frame);
	}

	function wake(): void {
		if (running) return;
		running = true;
		lastTime = performance.now();
		requestAnimationFrame(frame);
	}

	wake();
}

export {};
