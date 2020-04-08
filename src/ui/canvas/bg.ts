const grass = '#dcedc8';

const mkBackground = (width, height, zoom) => {
	const $bg = new OffscreenCanvas(width, height);
	const ctx = $bg.getContext('2d') as OffscreenCanvasRenderingContext2D;
	ctx.drawImage($bg, 0, 0);

	ctx.fillStyle = grass;
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.fill();

	let rows = new Array(Math.ceil(height / zoom)).fill(null);
	let columns = new Array(Math.ceil(width / zoom)).fill(null);
	ctx.globalAlpha = 0.05;
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
	});
	ctx.globalAlpha = 1;
	return $bg;
};

export { mkBackground };