// Reveals `.reveal` sections as they scroll into view. Loaded once per page
// from Layout.astro (MPA — no view transitions, so no re-init concerns).

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
				if (entry.isIntersecting) {
					entry.target.classList.add('reveal-visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
	);

	document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
		// Anything already in the viewport on load reveals immediately
		observer.observe(el);
	});
}

export {};
