import { GameState } from '../helper/defs';
import { addDirectionsToXY, anyDirectionList } from '../helper/direction';
import { mkFindXYInFlatMap } from '../helper/flatmap';
import { XY, xyMap } from '../helper/xy';

const HEIGHT_MAP_RESOLUTION = 10;

export const tileIsLand = (number: number) => number > 0.5;

export const xyIsLand = (gameState: GameState, xy: XY): boolean => {
	const { noise, height, size } = gameState.map;
	const randomMapAtXY = mkFindXYInFlatMap(noise, size);
	const heightMapAtXY = (xy: XY) => {
		if (xy.x > size || xy.x < 0) {
			return 0;
		}
		let finder = mkFindXYInFlatMap(height, size);
		let xyResolution = xyMap(xy, (pos, k) =>
			Math.floor(pos[k] / HEIGHT_MAP_RESOLUTION)
		);
		let current = finder(xyResolution);
		return current;
	};

	let thisTile = heightMapAtXY(xy);
	let tilesAround = addDirectionsToXY(xy, (xy) => heightMapAtXY(xy));

	if (tileIsLand(thisTile)) {
		return true;
	}

	let isLand: boolean = false;
	for (let direction of anyDirectionList) {
		let tileAround = tilesAround.get(direction);
		if (tileAround != null && tileIsLand(tileAround)) {
			let landAround = [...tilesAround.values()].filter(tileIsLand).length;
			isLand = tileIsLand(
				randomMapAtXY(xyMap(xy, (xy, k) => Math.floor(xy[k] / 2.5)))
			)
				? true
				: landAround < 3
				? true
				: false;
		}
	}
	return isLand;
};
