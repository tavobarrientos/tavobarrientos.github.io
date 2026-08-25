// Fades `.reveal` sections in as they enter the viewport and back out as
// they leave (either edge), so content passes over the fixed page background.
// The module loads once per session; with the client router swapping page
// content, the observer re-attaches on every astro:page-load.

function revealAll(): void {
	document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
		el.classList.add('reveal-visible');
	});
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let observer: IntersectionObserver | null = null;

function init(): void {
	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealAll();
		return;
	}

	observer?.disconnect();
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				entry.target.classList.toggle('reveal-visible', entry.isIntersecting);
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
	);

	document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
		observer!.observe(el);
	});
}

init();
document.addEventListener('astro:page-load', init);

export {};
