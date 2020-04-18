import { makeCanvas } from '../helper/canvas-store';

type Printable = string | number | boolean;

export const Print = (
	msgs: Printable | Printable[],
	{
		width = 80,
		height = 80,
	}: {
		width?: number;
		height?: number;
	} = {}
): OffscreenCanvas =>
	makeCanvas({ width, height }, [
		'print',
		Array.isArray(msgs) ? msgs.join() : msgs.toString(),
	])((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		if (!Array.isArray(msgs)) {
			msgs = [msgs];
		}
		msgs.forEach((msg, index) => {
			if (typeof msg === 'boolean') {
				ctx.fillStyle = !msg ? 'tomato' : 'lime';
				ctx.fillRect(0, 0, width, height);
			}
			ctx.fillStyle = 'black';
			ctx.font = '30px monospace';
			ctx.fillText(msg + '', 0, (index + 1) * 30);
		});
		return canvas;
	});
