import { XY, Direction } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { makeCanvas } from '../helper/canvas-store';
import { clamp } from '../../helper/math';
import { getMemory } from '../../global/memory';
import { Tile, TileProps } from './tile';

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
	makeCanvas({ width: tileSize, height: tileSize }, [
		atAbs.x,
		atAbs.y,
		'world',
	])((canvas) => {
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
				let largeriver = heightMapAtXY(10, {
					x: col + atAbs.x / 20,
					y: row + atAbs.y / 20,
				});
				let waterOnSides = {
					top:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row - 1 + atAbs.y / 20,
						}) < 0.4,
					bottom:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row + 1 + atAbs.y / 20,
						}) < 0.4,
					left:
						heightMapAtXY(10, {
							x: col - 1 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
					right:
						heightMapAtXY(10, {
							x: col + 1 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
				};
				let waterOnAfarSides = {
					top:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row - 2 + atAbs.y / 20,
						}) < 0.4,
					bottom:
						heightMapAtXY(10, {
							x: col + atAbs.x / 20,
							y: row + 2 + atAbs.y / 20,
						}) < 0.4,
					left:
						heightMapAtXY(10, {
							x: col - 2 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
					right:
						heightMapAtXY(10, {
							x: col + 2 + atAbs.x / 20,
							y: row + atAbs.y / 20,
						}) < 0.4,
				};

				let smoldetail = noiseMapAtXY({
					x: col + atAbs.x / 20,
					y: row + atAbs.y / 20,
				});

				let isLand = largeriver > 0.5;
				let props: TileProps = { type: 'full', color: 'water' };
				let directions: Direction[] = ['left', 'top', 'right', 'bottom'];
				if (isLand) {
					props.color = 'grass';
					for (let direction of directions) {
						if (waterOnSides[direction] && isLand) {
							let otherDirections = directions.filter((d) => d !== direction);
							props = {
								type: 'half',
								colors: ['water', 'dirt'],
								direction,
							};
							for (let otherDirection of otherDirections) {
								if (waterOnSides[otherDirection]) {
									props = {
										type: 'corner',
										colors: ['water', 'dirt'],
										direction: otherDirection,
									};
								}
							}
						}

						if (
							!waterOnSides[direction] &&
							waterOnAfarSides[direction] &&
							isLand
						) {
							let otherDirections = directions.filter((d) => d !== direction);
							let replaceProps: ?TileProps = {
								type: 'half',
								colors: ['dirt', 'grass'],
								direction,
							};
							for (let otherDirection of otherDirections) {
								if (waterOnSides[otherDirection]) {
									replaceProps = null;
								} else if (waterOnAfarSides[otherDirection]) {
									replaceProps = {
										type: 'corner',
										colors: ['dirt', 'grass'],
										direction: otherDirection,
									};
								}
							}
							if (replaceProps) {
								props = replaceProps;
							}
						}
					}
					//ctx.globalAlpha = drawEdge ? 0.5 : 1;
				}

				/*
				ctx.globalAlpha = clamp(
					{ min: 0, max: 1 },
					drawEdge
						? largeriver * (smoldetail / 2)
						: drawInnerEdge
						? largeriver * smoldetail
						: largeriver * 9999
				);
				*/
				ctx.drawImage(Tile(props), col * 20, row * 20, 20, 20);
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
