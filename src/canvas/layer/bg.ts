import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';

const grass = '#dcedc8';
const blueprint = '#4e72b5';

const bgLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	let drawn = [false, false];
	return ({ rendererState }) => {
		const { zoom, editMode } = rendererState;
		drawn[editMode ? 0 : 1] = true;
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
			ctx.beginPath();
			ctx.moveTo(0, i * zoom - 1);
			ctx.lineTo(width, i * zoom - 1);
			ctx.stroke();
		});
		columns.forEach((_, i) => {
			ctx.beginPath();
			ctx.moveTo(i * zoom - 1, 0);
			ctx.lineTo(i * zoom - 1, height);
			ctx.stroke();
			ctx.fillText(i.toString(), i * zoom - 1, zoom / 2);
		});
		return canvas;
	};
};

export { bgLayerRenderer };
