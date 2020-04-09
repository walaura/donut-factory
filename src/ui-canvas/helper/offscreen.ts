export const makeCanvasOrOnScreenCanvas = (width, height): OffscreenCanvas => {
	if ('OffscreenCanvas' in self) {
		return new OffscreenCanvas(width, height);
	}
	let $canvas = document.createElement('canvas');
	document.body.appendChild($canvas);
	return ($canvas as unknown) as OffscreenCanvas;
};
