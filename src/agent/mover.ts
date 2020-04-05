import { GameState, Road } from './../defs';
import {
	Agent,
	AgentState,
	AgentType,
	MoverState,
	MoverStateType,
} from '../defs';
const d3 = require('d3-polygon');

type Movement = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

const midpoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];

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

const distanceToOtherRoad = (road: Road['state'], [x, y]) => {
	let roadHyp = Math.hypot(road.x2 - road.x1, road.y2 - road.y1);
	let roadMidpoint = midpoint([road.x1, road.y1], [road.x2, road.y2]);
	return Math.min(
		Math.hypot(road.x1 - x, road.y1 - y) - roadHyp,
		Math.hypot(road.x2 - x, road.y2 - y) - roadHyp,
		Math.hypot(roadMidpoint[0] - x, roadMidpoint[1] - y) - roadHyp
	);
};

const closenessToRoad = (road: Road['state'], [x, y]) => {
	return Math.abs(
		d3.polygonArea([
			[road.x1, road.y1],
			[x, y],
			[road.x2, road.y2],
		])
	);
};

const atPos = (from: AgentState, to: AgentState) => {
	let tox = to.x;
	let toy = to.y;
	return Math.max(...[from.x - tox, toy - from.y].map(Math.abs)) < 1;
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
		movementHistory: [],
	};

	const move = (from: AgentState, to: AgentState, roads: Road[]) => {
		let speed = 0.05;
		let tox = to.x;
		let toy = to.y;

		let closestRoad = roads.sort(
			(a, b) =>
				distanceToOtherRoad(a.state, [from.x, from.y]) -
				distanceToOtherRoad(b.state, [from.x, from.y])
		)[0];
		let r = closestRoad.state;

		const isInRoad = () => closenessToRoad(r, [from.x, from.y]);
		const closestToRoad = (): Movement =>
			Object.fromEntries(
				Object.entries({
					right: closenessToRoad(r, [from.x + speed * 3, from.y]),
					left: closenessToRoad(r, [from.x - speed * 3, from.y]),
					top: closenessToRoad(r, [from.x + speed * 3, from.y]),
					bottom: closenessToRoad(r, [from.x - speed * 3, from.y]),
				}).sort((a, b) => b[1] - a[1])
			) as Movement;

		const applyMovement = (movement: Movement) => {
			from.x += movement.right * speed;
			from.x -= movement.left * speed;
			from.y += movement.bottom * speed;
			from.y -= movement.top * speed;
			console.log(Object.values(movement).reduce((a, b) => a + Math.abs(b)));
		};

		let movements: Movement[] = [];

		let distanceToRoad = isInRoad();
		if (distanceToRoad > 2) {
			const movement = correctForRoad(closestToRoad());
			movements.push(movement);
		}
		movements.push({
			left: from.x > tox ? from.x - tox : 0,
			right: from.x < tox ? tox - from.x : 0,
			top: from.y > toy ? from.y - toy : 0,
			bottom: from.y < toy ? toy - from.y : 0,
		});

		applyMovement(combineMovements(movements));
	};

	const loop = (tick, gameState: GameState) => {
		if (state.state === MoverStateType.Empty) {
			let moveTo = state.from[0];
			if (!atPos(state, moveTo.state)) {
				move(state, moveTo.state, gameState.roads);
			} else {
				state.held += 0.01;
				moveTo.state.exports -= 0.01;
			}
			if (state.held >= 1) {
				state.state = MoverStateType.Loaded;
			}
		} else {
			let moveTo = state.to[0];
			if (!atPos(state, moveTo.state)) {
				move(state, moveTo.state, gameState.roads);
			} else {
				state.held -= 0.01;
				moveTo.state.imports += 0.01;
			}
			if (state.held <= 0) {
				state.state = MoverStateType.Empty;
			}
		}
	};
	return { state, loop };
};

export { Mover };
