// Scroll reveals and the header's scrolled state. The module loads once per
// session; with the client router swapping page content, both re-attach on
// every astro:page-load. Under reduced motion nothing is armed, so the page
// renders finished.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let observer: IntersectionObserver | null = null;

function arm(): void {
	if (reduce || !('IntersectionObserver' in window)) return;
	document.documentElement.classList.add('motion');
	observer?.disconnect();
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('in');
					observer!.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
	);
	document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
		// Children of a staggered group get their index as a delay step
		const group = el.closest<HTMLElement>('[data-stagger]');
		if (group) {
			const siblings = Array.from(group.querySelectorAll('[data-reveal]'));
			el.style.setProperty('--i', String(Math.min(siblings.indexOf(el), 8)));
		}
		observer!.observe(el);
	});
}

function syncHeader(): void {
	const header = document.querySelector<HTMLElement>('[data-site-header]');
	if (!header) return;
	header.toggleAttribute('data-scrolled', window.scrollY > 24);
}

arm();
syncHeader();
document.addEventListener('astro:page-load', () => {
	arm();
	syncHeader();
});
// The html class is reset when the router swaps documents
document.addEventListener('astro:after-swap', () => {
	if (!reduce) document.documentElement.classList.add('motion');
});
window.addEventListener('scroll', syncHeader, { passive: true });

export {};
