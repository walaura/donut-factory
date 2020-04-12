import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkWorldToScreen } from '../helper/latlong';

const grass = '#dcedc8';
const blueprint = '#4e72b5';
const bgLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	return ({ rendererState }) => {
		const { zoom, viewport, editMode } = rendererState;
		const gridlines = zoom;
		const gameWorldToViewport = mkWorldToScreen(rendererState);
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = 1;

		ctx.font = '16px sans-serif';
		ctx.fillStyle = editMode ? blueprint : grass;
		ctx.fillRect(0, 0, width, height);
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
