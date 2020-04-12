import { makeCanvas } from '../helper/canvas-store';

export const width = 200;
export const height = 30;
const mkChip = ({ text }: { text: string }) =>
	makeCanvas(
		{ width, height },
		{ text, is: 'chip' }
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.clearRect(0, 0, 200, 50);
		ctx.font = '16px sans-serif bold';
		let metrics = ctx.measureText(text.toLocaleLowerCase());
		let padding = 8;
		let textBoxDimensions = {
			x: metrics.width,
			y: metrics.emHeightAscent + padding * 2,
		};
		let textBoxPosi = {
			x: textBoxDimensions.y / 2,
			y: 0,
		};

		let paddingLeft =
			(200 - (textBoxPosi.x + textBoxDimensions.x + textBoxDimensions.y / 2)) /
			2;

		ctx.fillStyle = '#13B477';
		ctx.fillRect(
			paddingLeft + textBoxPosi.x,
			textBoxPosi.y,
			textBoxDimensions.x,
			textBoxDimensions.y
		);
		ctx.beginPath();
		ctx.arc(
			paddingLeft + textBoxPosi.x,
			textBoxPosi.y + textBoxDimensions.y / 2,
			textBoxDimensions.y / 2,
			0,
			2 * Math.PI
		);
		ctx.arc(
			paddingLeft + textBoxPosi.x + textBoxDimensions.x,
			textBoxPosi.y + textBoxDimensions.y / 2,
			textBoxDimensions.y / 2,
			0,
			2 * Math.PI
		);
		ctx.fill();
		ctx.fillStyle = '#fff';
		ctx.fillText(
			text.toLocaleLowerCase(),
			paddingLeft + textBoxDimensions.y / 2,
			textBoxDimensions.y - padding
		);

		return canvas;
	});

export { mkChip };
