export const makeCanvasOrOnScreenCanvas = (width, height): OffscreenCanvas => {
	if ('OffscreenCanvas' in self) {
		return new OffscreenCanvas(width, height);
	}
	if ('document' in self) {
		let $canvas = document.createElement('canvas');
		document.body.appendChild($canvas);
		return ($canvas as unknown) as OffscreenCanvas;
	}
	throw 'Something failed rendering the canvases lol';
};
