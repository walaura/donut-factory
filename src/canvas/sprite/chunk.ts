import { getMemory } from '../../global/memory';
import { addDirectionsToXY, anyDirectionList } from '../../helper/direction';
import { XY, xyAdd, xyMap, xyMultiply } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { makeCanvas } from '../helper/canvas-store';
import { smoothTile, Tile, TileColor } from './tile';
import { xyIsLand } from '../../game/world';
import { mkXYFromFlatmapIndex } from '../../helper/flatmap';

const CHUNK_PX_SIZE = 600;
const TILE_PX_SIZE = 20;
const OFFSET = 1;
const TILE_COUNT = CHUNK_PX_SIZE / TILE_PX_SIZE + OFFSET * 2;

export const mkWorldChunk = ({
	atAbs,
	zoom,
}: {
	atAbs: XY;
	zoom: CanvasRendererStateViewport['zoom'];
}) =>
	makeCanvas({ width: CHUNK_PX_SIZE, height: CHUNK_PX_SIZE }, [
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
		ctx.clearRect(0, 0, CHUNK_PX_SIZE, CHUNK_PX_SIZE);
		let toXY = mkXYFromFlatmapIndex(TILE_COUNT);

		/*
		tiles gets a 32x32 board and needs 
		to offset it by 1 to draw it
		*/
		const tiles = new Array(TILE_COUNT * TILE_COUNT).fill(null);
		tiles.forEach((_, index) => {
			if (!gameState) {
				return;
			}
			let { x, y } = toXY(index);
			let worldXy = xyMap({ x, y }, (xy, k) => xy[k] + atAbs[k] / TILE_PX_SIZE);
			let color: TileColor = xyIsLand(gameState, worldXy) ? 'grass' : 'water';
			let neighbors = addDirectionsToXY(worldXy, (xy) =>
				gameState && xyIsLand(gameState, xy) ? 'grass' : 'water'
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
