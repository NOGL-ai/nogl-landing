export default function isInViewport(element: HTMLElement) {
	// Check if we're on the client side
	if (typeof window === 'undefined') {
		return false;
	}

	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}
