import { getMemory } from '../../global/memory';
import { addDirectionsToXY, anyDirectionList } from '../../helper/direction';
import { XY, xyAdd, xyMap, xyMultiply } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { makeCanvas } from '../helper/canvas-store';
import { smoothTile, Tile, TileColor } from './tile';
import { xyIsLand } from '../../game/world';

const tileSize = 600;

let mkFindXYInFlatMap = <T>(map: T[], size: number) => (xy: XY) => {
	return map[mkFlatmapIndexFromXY(size)(xy)];
};

const mkXYFromFlatmapIndex = (size: number) => (index: number): XY => {
	const x = index % size;
	const y = Math.floor(index / size);
	return { x, y };
};

const mkFlatmapIndexFromXY = (size: number) => ({ x, y }: XY): number => {
	return (y % size) * size + (x % size);
};

const isLand = (number: number) => number > 0.5;

const TILE_PX_SIZE = 20;
const OFFSET = 1;
const TILE_COUNT = tileSize / TILE_PX_SIZE + OFFSET * 2;

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
		let randomMapAtXY = mkFindXYInFlatMap(noise, size);
		let heightMapAtXY = (resolution, xy: XY) => {
			let pos = xyMap(xy, (xy, k) => xy[k] + atAbs[k] / TILE_PX_SIZE);
			if (pos.x > size || pos.x < 0) {
				return 0;
			}
			let finder = mkFindXYInFlatMap(height, size);
			let xyResolution = xyMap(pos, (pos, k) =>
				Math.floor(pos[k] / resolution)
			);
			let xyBlur = xyMap(pos, (pos, k) => (pos[k] % resolution) / resolution);
			let current = finder(xyResolution);
			let next = finder(xyAdd(xyResolution, { x: 1, y: 1 }));
			return current;
		};

		let tiles: TileColor[] = [];
		new Array(TILE_COUNT).fill(null).forEach((_, row) => {
			new Array(TILE_COUNT).fill(null).forEach((_, col) => {
				let xy = {
					x: col - OFFSET,
					y: row - OFFSET,
				};

				let largeriver = heightMapAtXY(10, xy);
				let tilesAround = addDirectionsToXY(xy, (xy) => heightMapAtXY(10, xy));

				let color: TileColor = 'water';
				if (isLand(largeriver)) {
					color = 'grass';
				}
				if (!isLand(largeriver)) {
					for (let direction of anyDirectionList) {
						let tileAround = tilesAround.get(direction);
						if (tileAround != null && isLand(tileAround)) {
							let landAround = [...tilesAround.values()].filter(isLand).length;
							color = isLand(
								randomMapAtXY(
									xyMap(xy, (xy, k) =>
										Math.floor((xy[k] + atAbs[k] / TILE_PX_SIZE) / 2.5)
									)
								)
							)
								? 'grass'
								: landAround < 3
								? 'grass'
								: 'water';
						}
					}
				}
				tiles.push(color);
			});
		});

		let toXY = mkXYFromFlatmapIndex(TILE_COUNT);
		let toIndex = mkFlatmapIndexFromXY(TILE_COUNT);

		/*
		tiles gets a 32x32 board and needs 
		to offset it by 1 to draw it
		*/
		tiles = new Array(TILE_COUNT * TILE_COUNT).fill(null);
		tiles.forEach((_, index) => {
			if (!gameState) {
				return;
			}
			let { x, y } = toXY(index);
			let color: TileColor = xyIsLand(
				gameState,
				xyMap({ x, y }, (xy, k) => xy[k] + atAbs[k] / TILE_PX_SIZE)
			)
				? 'grass'
				: 'water';
			let neighbors = addDirectionsToXY({ x, y }, (xy) =>
				xyIsLand(
					gameState,
					xyMap(xy, (xy, k) => xy[k] + atAbs[k] / TILE_PX_SIZE)
				)
					? 'grass'
					: 'water'
			);

			let tile = Tile({ type: 'full', color });
			if (color === 'water') {
				let tileMaybe = smoothTile('water', 'grass', neighbors);
				if (tileMaybe) {
					tile = tileMaybe;
				}
			}

			let drawAt = xyMultiply(xyAdd({ x, y }, { x: -1, y: -1 }), {
				x: TILE_PX_SIZE,
				y: TILE_PX_SIZE,
			});

			/* a full tile? wonderful */
			ctx.drawImage(tile, drawAt.x, drawAt.y, TILE_PX_SIZE, TILE_PX_SIZE);
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
