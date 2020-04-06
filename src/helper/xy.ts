export interface XY {
	x: number;
	y: number;
}

const xy2arr = ({ x, y }: XY): [number, number] => [x, y];
const xy = ([x, y]): XY => ({ x, y });

const midpoint = ({ x: x1, y: y1 }: XY, { x: x2, y: y2 }: XY): XY => ({
	x: (x1 + x2) / 2,
	y: (y1 + y2) / 2,
});

const scale = (xy: XY, scale: number): XY => ({
	x: xy.x * scale,
	y: xy.y * scale,
});

export { xy, xy2arr, midpoint, scale };
