import { WithXY } from '../defs';

const xy2arr = ({ x, y }: WithXY) => [x, y];
const xy = ([x, y]): WithXY => ({ x, y });

const midpoint = (
	{ x: x1, y: y1 }: WithXY,
	{ x: x2, y: y2 }: WithXY
): WithXY => ({
	x: (x1 + x2) / 2,
	y: (y1 + y2) / 2,
});

export { xy, xy2arr, midpoint };
