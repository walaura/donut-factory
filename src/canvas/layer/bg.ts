import { mkWorldTile } from './../sprite/world-tile';
import { declamp } from './../helper/math';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkWorldToScreen } from '../helper/latlong';
import { XY } from '../../helper/xy';
import { clamp } from '../helper/math';
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
				let col2 = col - Math.ceil(viewport.x / 600);
				let row2 = row - Math.ceil(viewport.y / 600);
				ctx.drawImage(
					mkWorldTile({
						noise,
						zoom,
						at: { x: chunkSize * col2, y: chunkSize * row2 },
					}),
					0 + viewport.x + chunkSize * col2,
					0 + viewport.y + chunkSize * row2,
					chunkSize,
					chunkSize
				);
				if (debugMode) {
					ctx.strokeStyle = '4px solid red';
					ctx.font = '20px sans-serif';
					ctx.fillStyle = 'red';
					ctx.fillText(`${rows.length}row ${columns.length}col`, 40, 40);
					ctx.strokeRect(
						0 + viewport.x + chunkSize * col2,
						0 + viewport.y + chunkSize * row2,
						chunkSize,
						chunkSize
					);
				}
			});
		});
		return canvas;
	};
};

export { bgLayerRenderer };
