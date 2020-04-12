import { makeCanvas } from '../helper/canvas-store';

const Scaler = ({
	width = 100,
	height = 100,
	offset = 20,
	scale = 0,
	rotate = 0,
	drawable,
}) =>
	makeCanvas(
		{
			width: width + 2 * offset,
			height: height + 2 * offset,
		},
		null
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		const realWidth = width + 2 * offset;
		const realHeight = height + 2 * offset;
		ctx.setTransform();
		if (rotate) {
			ctx.translate(realWidth / 2, realHeight / 2);
			ctx.rotate(rotate);
			ctx.translate(realWidth / -2, realHeight / -2);
		}
		if (scale) {
			ctx.translate(realWidth / 2, realHeight / 2);
			ctx.scale(scale, scale);
			ctx.translate(realWidth / -2, realHeight / -2);
		}
		ctx.drawImage(drawable, offset, offset);

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		return canvas;
	});

export { Scaler };
