import { GameState, Road, WithXY } from './../defs';
import {
	Agent,
	AgentState,
	AgentType,
	MoverState,
	MoverStateType,
} from '../defs';
import { xy2arr, xy } from '../helper/xy';
import { listen, MsgActions } from '../helper/message';
const d3 = require('d3-polygon');

type Movement = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};
const addSpeed = (movement: Movement, speed: number): Movement => ({
	right: movement.right * speed,
	left: movement.left * speed,
	bottom: movement.bottom * speed,
	top: movement.top * speed,
});

const midpoint = (
	{ x: x1, y: y1 }: WithXY,
	{ x: x2, y: y2 }: WithXY
): WithXY => ({
	x: (x1 + x2) / 2,
	y: (y1 + y2) / 2,
});

const combineMovements = (mvmnts: Movement[]): Movement => {
	let movement = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	};
	mvmnts.forEach((mvmnt) => {
		movement.left += mvmnt.left;
		movement.right += mvmnt.right;
		movement.top += mvmnt.top;
		movement.bottom += mvmnt.bottom;
	});
	return movement;
};

const correctForRoad = (obj: Movement) => {
	let max = Math.max(...Object.values(obj));
	return Object.fromEntries(
		Object.entries(obj).map(([k, val]) => [k, max - val])
	) as Movement;
};

const getRoadMoverMinDistance = (road: Road['state'], { x, y }: WithXY) => {
	let roadHyp = Math.hypot(
		road.start.x - road.end.x,
		road.start.y - road.end.y
	);
	/* get midpoint too just in case the vehice is roaming round the field */
	let roadMidpoint = midpoint(road.start, road.end);
	return Math.min(
		Math.hypot(road.start.x - x, road.start.y - y) - roadHyp,
		Math.hypot(road.end.x - x, road.end.y - y) - roadHyp,
		Math.hypot(roadMidpoint.x - x, roadMidpoint.y - y) - roadHyp
	);
};

const getRoadMoverTriangleArea = (road: Road['state'], mover: WithXY) => {
	return Math.abs(
		d3.polygonArea([xy2arr(road.start), xy2arr(mover), xy2arr(road.end)])
	);
};

const atPos = (from: WithXY, to: WithXY) => {
	return Math.hypot(from.x - to.x, from.y - to.y) < 1;
};

const Mover = (from = [], to = []): Agent => {
	let state: MoverState = {
		emoji: '🚚',
		x: 10,
		y: 0,
		held: 0,
		type: AgentType.MOVER,
		from,
		to,
		state: MoverStateType.Empty,
		path: [],
		//distanceHistory: [],
	};

	const move = (from: WithXY, to: WithXY, roads: Road[]) => {
		let speed = 0.05;

		let closestRoad = roads.sort(
			(a, b) =>
				getRoadMoverMinDistance(a.state, from) -
				getRoadMoverMinDistance(b.state, from)
		)[0];
		let r = closestRoad.state;
		const closestToRoad = (): Movement => {
			const transforms = {
				left: xy([from.x - speed, from.y]),
				right: xy([from.x + speed, from.y]),
				top: xy([from.x, from.y + speed]),
				bottom: xy([from.x, from.y - speed]),
			};
			const apply = (t: WithXY) => getRoadMoverTriangleArea(r, t);
			return Object.fromEntries(
				Object.entries({
					bottom: apply(transforms.bottom),
					left: apply(transforms.left),
					top: apply(transforms.top),
					right: apply(transforms.right),
				})
			) as Movement;
		};
		const applyMovement = (movement: Movement) => {
			from.x += movement.right;
			from.x -= movement.left;
			from.y += movement.bottom;
			from.y -= movement.top;
		};

		let movements: Movement[] = [];
		const triangleArea = Math.max(getRoadMoverTriangleArea(r, from), 10);
		const movement = correctForRoad(closestToRoad());
		movements.push(addSpeed(movement, speed / 10));
		movements.push(
			addSpeed(
				{
					left: from.x > to.x ? from.x - to.x : 0,
					right: from.x < to.x ? to.x - from.x : 0,
					top: from.y > to.y ? from.y - to.y : 0,
					bottom: from.y < to.y ? to.y - from.y : 0,
				},
				triangleArea < 2 ? speed : speed / 10
			)
		);

		applyMovement(combineMovements(movements));
	};

	const isEmpty = () => state.held <= 0;

	const loop = (tick, gameState: GameState) => {
		let moveFrom = state.from[0];
		let moveTo = state.to[0];
		if (state.path.length > 0) {
			let currentVisit = state.path[0];
			if (!atPos(state, currentVisit)) {
				move(state, currentVisit, gameState.roads);
			} else {
				state.path.shift();
			}
		}

		if (atPos(state, moveFrom.state)) {
			state.held += 0.01;
			moveFrom.state.exports -= 0.01;
			if (state.held >= 1) {
				state.path = [gameState.roads[0].state.end, moveTo.state];
			}
		}
		if (atPos(state, moveTo.state)) {
			state.held -= 0.01;
			moveTo.state.imports += 0.01;
			if (isEmpty()) {
				state.path = [gameState.roads[0].state.end, moveFrom.state];
			}
		}

		if (isEmpty() && state.path.length === 0) {
			state.path.push(moveFrom.state);
		}
	};
	return { state, loop };
};

export { Mover };
