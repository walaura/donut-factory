import { XY } from '../../helper/xy';
import { makeCanvas } from '../helper/canvas-store';

export type ScalerProps = {
	width: number;
	height: number;
	offset: number;
	scale?: number;
	rotate?: number;
	memoId?: any;
};

const Scaler = (
	drawable: CanvasImageSource,
	{
		width = 100,
		height = 100,
		offset,
		scale = 0,
		rotate = 0,
		memoId,
	}: ScalerProps
) => {
	const realWidth = width + offset * 2;
	const realHeight = height + offset * 2;

	return makeCanvas(
		{
			width: realWidth,
			height: realHeight,
		},
		[width, height, scale, rotate, offset, memoId]
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.clearRect(0, 0, realWidth, realHeight);

		ctx.setTransform();
		if (rotate) {
			ctx.translate(realWidth / 2, realHeight / 2);
			ctx.rotate(rotate);
			ctx.translate(realWidth / -2, realHeight / -2);
		}
		if (scale) {
			let fac = {
				x: realWidth / Math.max(realWidth, realHeight),
				y: realWidth / Math.max(realWidth, realHeight),
			};
			ctx.translate(realWidth / 2, realHeight / 2);
			ctx.scale(scale / fac.x, scale / fac.y);
			ctx.translate(realWidth / -2, realHeight / -2);
		}
		if (self.memory.id === 'CANVAS-WK' && self.memory.state?.debugMode) {
			ctx.fillText(offset + '/' + width, 10, 10);
			ctx.fillText(scale + '/' + rotate, 10, height);
		}
		ctx.drawImage(drawable, offset, offset, width, height);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		return canvas;
	});
};

export const drawScaled = (
	ctx: OffscreenCanvasRenderingContext2D,
	drawable: CanvasImageSource,
	scalerProps: ScalerProps,
	{ x, y }: XY
) => {
	if (!scalerProps.offset) {
		scalerProps.offset = 20;
	}

	let scaled = Scaler(drawable, scalerProps);
	ctx.drawImage(scaled, x - scalerProps.offset, y - scalerProps.offset);
};

export { Scaler };
