import { XY } from './xy';

export let mkFindXYInFlatMap = <T>(map: T[], size: number) => (xy: XY) => {
	return map[mkFlatmapIndexFromXY(size)(xy)];
};

export const mkXYFromFlatmapIndex = (size: number) => (index: number): XY => {
	const x = index % size;
	const y = Math.floor(index / size);
	return { x, y };
};

export const mkFlatmapIndexFromXY = (size: number) => ({
	x,
	y,
}: XY): number => {
	return (y % size) * size + (x % size);
};
