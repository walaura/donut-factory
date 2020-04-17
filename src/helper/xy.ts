export interface XY {
	x: number;
	y: number;
}
export interface Size {
	width: number;
	height: number;
}

export type Direction = 'left' | 'top' | 'right' | 'bottom';

const xy2arr = ({ x, y }: XY): [number, number] => [x, y];
const xy = ([x, y]): XY => ({ x, y });

const midpoint = ({ x: x1, y: y1 }: XY, { x: x2, y: y2 }: XY): XY => ({
	x: (x1 + x2) / 2,
	y: (y1 + y2) / 2,
});

const xyScale = (xy: XY, scale: number): XY => ({
	x: xy.x * scale,
	y: xy.y * scale,
});

type MapKey = 'x' | 'y';

const xyMap = (xy: XY, fn: (xy: XY, k: MapKey) => XY['x'] | XY['y']): XY => ({
	x: fn(xy, 'x'),
	y: fn(xy, 'y'),
});

const xyRound = (xy: XY) => xyMap(xy, (xy, k) => Math.floor(xy[k]));
const xyAdd = (from: XY, to: XY) => xyMap(from, (xy, k) => xy[k] + to[k]);

export {
	xy,
	xy2arr,
	xyMap,
	midpoint,
	xyScale as scale,
	xyScale,
	xyRound,
	xyAdd,
};
