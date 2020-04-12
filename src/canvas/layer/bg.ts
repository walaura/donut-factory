import { absToViewport } from './../helper/latlong';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkWorldTile } from './../sprite/world-tile';
import { xy } from '../../helper/xy';
const perlin = require('perlin-noise');

const grass = '#ccd9bd';
const blueprint = '#4e72b5';

const noiseResolution = 2;
const noiseWidth = 300;

let noise = perlin.generatePerlinNoise(
	noiseWidth,
	Math.round(noiseWidth * 0.75),
	{
		octaveCount: 2,
		persistence: 0,
	}
);

const chunkSize = 600;

const bgLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	return ({ rendererState }) => {
		const { zoom, viewport, editMode, debugMode } = rendererState;
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;
		ctx.fillStyle = editMode ? blueprint : grass;
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
					mkWorldTile({
						noise,
						zoom,
						atAbs,
					}),
					atViewport.x,
					atViewport.y,
					chunkSize,
					chunkSize
				);
				if (debugMode) {
					ctx.strokeStyle = '4px solid red';
					ctx.font = '20px sans-serif';
					ctx.fillStyle = 'red';
					ctx.fillText(`${rows.length}row ${columns.length}col`, 40, 40);
					ctx.strokeRect(atViewport.x, atViewport.y, chunkSize, chunkSize);
				}
			});
		});
		return canvas;
	};
};

export { bgLayerRenderer };
