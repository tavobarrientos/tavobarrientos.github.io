// Cursor spotlight for .spotlight cards: tracks the pointer with two CSS vars
// consumed by the ::before radial gradient (see main.css). One delegated
// listener for the whole page; no-ops on touch (hover never fires there) and
// costs nothing when no .spotlight is under the pointer.
if (window.matchMedia('(pointer: fine)').matches) {
	document.addEventListener(
		'pointermove',
		(event) => {
			const card = (event.target as Element | null)?.closest?.('.spotlight');
			if (!(card instanceof HTMLElement)) return;
			const rect = card.getBoundingClientRect();
			card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
			card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
		},
		{ passive: true }
	);
}
