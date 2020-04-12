import { XY, xyMap, xy2arr, xy } from './xy';
import { getDistanceToPoint } from './pathfinding';

export type Movement = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export const isAtPos = (from: XY, to: XY) => {
	return getDistanceToPoint(from, to) < 1;
};

export const addSpeedToMovement = (
	movement: Movement,
	speed: number
): Movement => ({
	right: movement.right * speed,
	left: movement.left * speed,
	bottom: movement.bottom * speed,
	top: movement.top * speed,
});

export const applyMovement = <From extends XY>(
	from: From,
	movement: Movement
): From => {
	from.x += movement.right;
	from.x -= movement.left;
	from.y += movement.bottom;
	from.y -= movement.top;
	return from;
};

export const chase = (from: XY, to: XY): Movement => ({
	left: from.x > to.x ? from.x - to.x : 0,
	right: from.x < to.x ? to.x - from.x : 0,
	top: from.y > to.y ? from.y - to.y : 0,
	bottom: from.y < to.y ? to.y - from.y : 0,
});

export const chaseLinear = (from: XY, to: XY): Movement => {
	let diff = xyMap(from, (from, t) => Math.abs(from[t] - to[t]));
	let faster = Math.max(...xy2arr(diff));
	let speed = xy([diff.x / faster, diff.y / faster]);
	let erraticNess = Math.random() / 5;
	speed = xyMap(speed, (xy, t) => xy[t] + erraticNess);
	return {
		left: from.x > to.x ? speed.x : 0,
		right: from.x < to.x ? speed.x : 0,
		top: from.y > to.y ? speed.y : 0,
		bottom: from.y < to.y ? speed.y : 0,
	};
};
