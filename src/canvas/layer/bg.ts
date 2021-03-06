import { xy } from '../../helper/xy';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkWorldChunk } from '../sprite/chunk';
import { absToViewport } from './../helper/latlong';
import { CanvasExceptionalMode } from '../../wk/canvas.defs';

const water = 'hotpink';
const blueprint = '#4e72b5';

const chunkSize = 600;

const bgLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	return ({ state, rendererState }) => {
		const { zoom, viewport, mode, debugMode } = rendererState;

		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;
		ctx.fillStyle = mode ? blueprint : water;
		ctx.fillRect(0, 0, width, height);
		let rows = new Array(Math.ceil(height / chunkSize) + 1).fill(null);
		let columns = new Array(Math.ceil(width / chunkSize) + 1).fill(null);

		rows.forEach((_, row) => {
			columns.forEach((_, col) => {
				let offset = {
					x: col - Math.ceil(viewport.x / 600),
					y: row - Math.ceil(viewport.y / 600),
				};
				let atAbs = xy([chunkSize * offset.x, chunkSize * offset.y]);
				let atViewport = absToViewport(atAbs);
				ctx.drawImage(
					mkWorldChunk({
						zoom,
						atAbs,
					}),
					atViewport.x,
					atViewport.y,
					chunkSize,
					chunkSize
				);
				if (debugMode) {
					if (mode) {
						ctx.fillText(mode, 40, 80);
					}
					ctx.strokeStyle = '4px solid red';
					ctx.font = '20px sans-serif';
					ctx.fillStyle = 'red';
					ctx.fillText(`${rows.length}row ${columns.length}col`, 40, 40);
					ctx.strokeRect(atViewport.x, atViewport.y, chunkSize, chunkSize);
					ctx.fillText(`${atAbs.x}x ${atAbs.y}y`, atViewport.x, atViewport.y);
				}
			});
		});
		return canvas;
	};
};

export { bgLayerRenderer };
