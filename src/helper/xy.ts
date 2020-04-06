import { XY } from '../defs';

const xy2arr = ({ x, y }: XY) => [x, y];
const xy = ([x, y]): XY => ({ x, y });

const midpoint = ({ x: x1, y: y1 }: XY, { x: x2, y: y2 }: XY): XY => ({
	x: (x1 + x2) / 2,
	y: (y1 + y2) / 2,
});

export { xy, xy2arr, midpoint };
