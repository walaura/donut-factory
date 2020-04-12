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
const noiseWidth = 100;

let noise = perlin
	.generatePerlinNoise(noiseWidth, Math.round(noiseWidth * 0.75))
	.map((element) => {
		if (element > 0.2) {
			return element * 1.5;
		}
		return element * 0.5;
	});

const bgLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	return ({ rendererState }) => {
		const { zoom, viewport, editMode } = rendererState;
		const gridlines = zoom;
		const world2screen = mkWorldToScreen(rendererState);
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;

		ctx.font = '16px sans-serif';
		ctx.fillStyle = editMode ? blueprint : grass;
		ctx.fillRect(0, 0, width, height);

		noise.forEach((el, index) => {
			const wx = (index % noiseWidth) * noiseResolution;
			const wy = Math.floor(index / noiseWidth) * noiseResolution;
			let { x, y } = world2screen({ x: wx, y: wy });
			if (el > 0.6) {
				ctx.globalAlpha = el;
				ctx.fillStyle = '#ccd9bd';
				ctx.globalAlpha = 0.5 - el;
			} else if (el > 0.4) {
				ctx.globalAlpha = 1 - declamp({ max: 0.6, min: 0.3 }, el);
				ctx.fillStyle = '#faf0dc';
			} else {
				//	ctx.globalAlpha = 1 - declamp({ max: 0.4, min: 0 }, el);
				ctx.fillStyle = '#87ffed';
			}
			ctx.fillRect(x, y, zoom * noiseResolution, zoom * noiseResolution);
		});

		let rows = new Array(Math.ceil(height / zoom)).fill(null);
		let columns = new Array(Math.ceil(width / zoom)).fill(null);
		ctx.fillStyle = editMode ? 'white' : 'black';
		ctx.globalAlpha = editMode ? 0.15 : 0.05;
		rows.forEach((_, i) => {
			let oi = i;
			oi = i - Math.ceil(viewport.y / gridlines);
			ctx.beginPath();
			ctx.moveTo(0, oi * zoom + viewport.y - 1);
			ctx.lineTo(width, oi * zoom + viewport.y - 1);
			ctx.stroke();
		});
		columns.forEach((_, i) => {
			let oi = i;
			oi = i - Math.ceil(viewport.x / gridlines);
			ctx.beginPath();
			ctx.moveTo(oi * gridlines + viewport.x - 1, 0);
			ctx.lineTo(oi * gridlines + viewport.x - 1, height);
			ctx.stroke();
		});
		return canvas;
	};
};

export { bgLayerRenderer };
