import { XY } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { makeCanvas } from '../helper/canvas-store';
import { declamp } from '../helper/math';

const noiseResolution = 20;
const noiseWidth = 300;

export const mkWorldTile = ({
	atAbs,
	zoom,
	noise,
}: {
	atAbs: XY;
	zoom: CanvasRendererStateViewport['zoom'];
	noise: number[];
}) =>
	makeCanvas(
		{ width: 600, height: 600 },
		[atAbs.x, atAbs.y, 'world'].join()
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.clearRect(0, 0, 600, 600);
		// noise & fake water
		noise.forEach((el, index) => {
			const wx = (index % noiseWidth) * noiseResolution;
			const wy = Math.floor(index / noiseWidth) * noiseResolution;
			let { x, y } = {
				x: wx,
				y: wy,
			};

			ctx.globalAlpha = 0;
			ctx.fillStyle = 'black';
			if (el < 0.1) {
				ctx.globalAlpha = 0.125;
				ctx.fillStyle = '#4CEFFF';
			}
			if (el > 0.4) {
				ctx.globalAlpha = 0.1;
				ctx.fillStyle = '#FFED61';
			}
			if (el > 0.8) {
				ctx.globalAlpha = 0.1;
				ctx.fillStyle = '#fff';
			}
			ctx.fillRect(x - atAbs.x, y - atAbs.y, noiseResolution, noiseResolution);
		});

		// gridlines
		ctx.globalAlpha = 0.05;
		let rows = new Array(Math.ceil(600 / zoom) + 1).fill(null);
		let columns = new Array(Math.ceil(600 / zoom) + 1).fill(null);
		rows.forEach((_, i) => {
			ctx.beginPath();
			ctx.moveTo(0, i * zoom - 1);
			ctx.lineTo(600, i * zoom - 1);
			ctx.stroke();
		});
		columns.forEach((_, i) => {
			ctx.beginPath();
			ctx.moveTo(i * zoom, 0);
			ctx.lineTo(i * zoom, 600);
			ctx.stroke();
		});
		return canvas;
	});
