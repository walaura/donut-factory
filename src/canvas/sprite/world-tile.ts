import { XY } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { makeCanvas } from '../helper/canvas-store';
import { clamp } from '../../helper/math';
import { getMemory } from '../../global/memory';

const noiseResolution = 20;
const tileSize = 600;
const grass = '#d8f2c4';
const dirt = '#b8b3ae';

export const mkWorldTile = ({
	atAbs,
	zoom,
}: {
	atAbs: XY;
	zoom: CanvasRendererStateViewport['zoom'];
}) =>
	makeCanvas(
		{ width: tileSize, height: tileSize },
		[atAbs.x, atAbs.y, 'world'].join()
	)((canvas) => {
		let mm = getMemory('CANVAS-WK');
		let gameState = mm.memory.lastKnownGameState;
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		if (!gameState) {
			return canvas;
		}
		ctx.clearRect(0, 0, tileSize, tileSize);
		let { noise, height, size } = gameState.map;

		// rivers
		let rivers = [...height];
		let heightMapAtXY = (resolution, { x, y }: XY) => {
			if (x / resolution > size) {
				return 0;
			}
			if (x < 0) {
				return 0;
			}
			y = Math.floor(y / resolution);
			x = Math.floor(x / resolution);
			return height[y * size + x] ?? 0;
		};

		let noiseMapAtXY = ({ x, y }: XY) => {
			y = Math.floor(y % size);
			x = Math.floor(x % size);
			return noise[y * size + x] ?? 0;
		};

		new Array(tileSize / 20).fill(null).forEach((_, row) => {
			new Array(tileSize / 20).fill(null).forEach((_, col) => {
				let isTopEdge = row % 10 == 0;
				let isTopInnerEdge = row % 10 == 1;
				let isBottomEdge = row % 10 == 9;
				let isBottomInnerEdge = row % 10 == 8;
				let isLeftEdge = col % 10 == 0;
				let isLeftInnerEdge = col % 10 == 1;
				let isRightEdge = col % 10 == 9;
				let isRightInnerEdge = col % 10 == 8;

				let largeriver = heightMapAtXY(10, {
					x: col + atAbs.x / 20,
					y: row + atAbs.y / 20,
				});
				let waterOnSides = {
					top:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row - 10 + atAbs.y / 20,
						}) < 0.4,
					bottom:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row + 10 + atAbs.y / 20,
						}) < 0.4,
					left:
						heightMapAtXY(10, {
							x: col - 10 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
					right:
						heightMapAtXY(10, {
							x: col + 10 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
				};

				let smoldetail = noiseMapAtXY({
					x: col + atAbs.x / 20,
					y: row + atAbs.y / 20,
				});

				let drawEdge =
					(waterOnSides.top && isTopEdge) ||
					(waterOnSides.bottom && isBottomEdge) ||
					(waterOnSides.left && isLeftEdge) ||
					(waterOnSides.right && isRightEdge);
				let drawInnerEdge =
					(waterOnSides.top && isTopInnerEdge) ||
					(waterOnSides.bottom && isBottomInnerEdge) ||
					(waterOnSides.left && isLeftInnerEdge) ||
					(waterOnSides.right && isRightInnerEdge);

				if (largeriver > 0.5) {
					ctx.fillStyle = dirt;
					ctx.globalAlpha = drawEdge ? 0.5 : 1;
					ctx.fillRect(col * 20, row * 20, 20, 20);
				}

				ctx.fillStyle = grass;
				ctx.globalAlpha = clamp(
					{ min: 0, max: 1 },
					drawEdge
						? largeriver * (smoldetail / 2)
						: drawInnerEdge
						? largeriver * smoldetail
						: largeriver * 9999
				);
				ctx.fillRect(col * 20, row * 20, 20, 20);
			});
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
