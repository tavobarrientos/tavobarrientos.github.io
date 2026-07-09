// Fades `.reveal` sections in as they enter the viewport and back out as
// they leave (either edge), so content passes over the fixed page background.
// Loaded once per page from Layout.astro (MPA — no view transitions, so no
// re-init concerns).

function revealAll(): void {
	document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
		el.classList.add('reveal-visible');
	});
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion || !('IntersectionObserver' in window)) {
	revealAll();
} else {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				entry.target.classList.toggle('reveal-visible', entry.isIntersecting);
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
	);

	document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
		observer.observe(el);
	});
}

export {};
