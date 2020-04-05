import { pauseGame } from './../loop/loop';
import { AgentStateType, BaseAgent, ID } from '../defs';
import { Road, RoadEnd } from '../dressing/road';
import { midpoint, xy, xy2arr } from '../helper/xy';
import { findAgent, mutateAgent } from '../loop/loop';
import { Handler, UnitAgent, WithXY } from './../defs';
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

const getRoadMoverMinDistance = (road: Road, { x, y }: WithXY) => {
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

const getRoadMoverTriangleArea = (road: Road, mover: WithXY) => {
	return Math.abs(
		d3.polygonArea([xy2arr(road.start), xy2arr(mover), xy2arr(road.end)])
	);
};

const getDistanceToPoint = (a: WithXY, b: WithXY) => {
	return Math.hypot(a.x - b.x, a.y - b.y);
};

const atPos = (from: WithXY, to: WithXY) => {
	return Math.hypot(from.x - to.x, from.y - to.y) < 1;
};

type Target =
	| {
			roadId: ID;
			roadEnd: RoadEnd;
	  }
	| {
			agentId: ID;
	  }
	| { xy: WithXY }
	| { isFinal: true; xy: WithXY };

type StatefulTarget = Target & {
	debug?: any;
	score: number;
};

type NestedStatefulTarget = StatefulTarget & {
	next?: NestedStatefulTarget[];
};

const unnestTargets = (
	what: NestedStatefulTarget[]
): { path: StatefulTarget[]; score: number }[] => {
	let paths: StatefulTarget[][] = [];
	const visitor = (
		history: StatefulTarget[] = [],
		what: NestedStatefulTarget[]
	) => {
		for (let w of what) {
			if (w.next) {
				const { next, ...filter } = w;
				visitor([...history, filter], w.next);
			} else {
				const pushable: StatefulTarget[] = [
					...(history as StatefulTarget[]),
					w as StatefulTarget,
				];
				paths.push(pushable);
			}
		}
	};
	visitor([], what);

	return paths
		.map((path) => ({
			path,
			score: path.reduce((acc, { score }) => acc + score, 0),
		}))
		.sort((a, b) => a.score - b.score)
		.splice(0, 4);
};

const targetFromXY = ({ x, y }: WithXY): Target => ({ xy: { x, y } });

export const moverHandler: Handler<MoverAgent> = (tick, state, gameState) => {
	const findTarget = (target: Target): WithXY => {
		if ('roadId' in target) {
			return gameState.roads[target.roadId][target.roadEnd];
		}
		if ('agentId' in target) {
			return findAgent(target.agentId, gameState);
		}
		return target.xy;
	};

	const isEmpty = () => state.held <= 0;

	const path = (from: WithXY, to: WithXY, roads: Road[]): Target[] => {
		const usableRoads: Target[] = roads
			.map((road) => [
				{
					roadId: road.id,
					roadEnd: RoadEnd.end,
				},
				{
					roadId: road.id,
					roadEnd: RoadEnd.start,
				},
			])
			.flat();
		usableRoads.push({ ...targetFromXY(from), isFinal: true });

		const getDistanceScoreFrom = (
			targets: Target[],
			from: Target
		): StatefulTarget[] => {
			const xy = findTarget(from);
			return targets
				.map((rd) => {
					const road = findTarget(rd);
					let score = getDistanceToPoint(road, xy);
					// prefer same road
					if ('roadId' in from && 'roadId' in rd) {
						if (from.roadId === rd.roadId) {
							score = score / 10;
						}
					}
					return { ...rd, score };
				})
				.sort((a, b) => a.score - b.score);
		};

		const addNext = (
			targets: Target[],
			fromTarget: Target
		): NestedStatefulTarget[] => {
			const score = getDistanceScoreFrom(targets, fromTarget);
			return score.map((target) => {
				if ('isFinal' in target) {
					return target;
				}
				const road = findTarget(target);
				const nextTargets = targets.filter((tg) => findTarget(tg) !== road);
				const next = addNext(nextTargets, target);
				return { ...target, next };
			});
		};

		const journeys = addNext([...usableRoads], targetFromXY(to));
		const best = unnestTargets(journeys)[0].path;
		const path = [...best.reverse(), targetFromXY(to)];
		return path;
	};

	const move = (from: WithXY, to: WithXY, roads: Road[]) => {
		let speed = 0.05;

		let closestRoad = roads.sort(
			(a, b) =>
				getRoadMoverMinDistance(a, from) - getRoadMoverMinDistance(b, from)
		)[0];
		let r = closestRoad;
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
				speed / 2
			)
		);

		applyMovement(combineMovements(movements));
	};

	let moveFrom = findAgent(state.from[0], gameState);
	let moveTo = findAgent(state.to[0], gameState);
	if (state.path.length > 0) {
		let currentVisit = findTarget(state.path[0]);
		if (!atPos(state, currentVisit)) {
			move(state, currentVisit, Object.values(gameState.roads));
		} else {
			state.path.shift();
		}
	}

	if (atPos(state, moveFrom)) {
		state.held += state.loadSpeed;
		mutateAgent<UnitAgent>(moveFrom.id, (prev) => ({
			...prev,
			exports: prev.exports - state.loadSpeed,
		}));
		if (state.held >= state.capacity && state.path.length <= 0) {
			state.path = path(state, moveTo, Object.values(gameState.roads));
		}
	}
	if (atPos(state, moveTo)) {
		state.held -= state.loadSpeed;
		mutateAgent<UnitAgent>(moveTo.id, (prev) => ({
			...prev,
			imports: prev.imports + state.loadSpeed,
		}));
		if (isEmpty() && state.path.length <= 0) {
			state.path = path(state, moveFrom, Object.values(gameState.roads));
			pauseGame();
		}
	}

	if (isEmpty() && state.path.length === 0) {
		state.path.push({ agentId: moveFrom.id });
	}

	return state;
};

export interface MoverAgent extends BaseAgent {
	held: number;
	loadSpeed: number;
	capacity: number;
	from: ID[];
	to: ID[];
	type: AgentStateType.MOVER;
	path: Target[];
}

const MkMover = (from = [], to = []): MoverAgent => {
	return {
		id: 'TEST_mover',
		emoji: '🚚',
		x: 10,
		y: 0,
		held: 0,
		type: AgentStateType.MOVER,
		from,
		to,
		path: [],
		handler: 'moverHandler',
		loadSpeed: 0.75,
		capacity: 4,
		//distanceHistory: [],
	};
};

export { MkMover };
