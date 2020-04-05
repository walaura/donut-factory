import { pauseGame } from './../loop/loop';
import { AgentStateType, BaseAgent, ID } from '../defs';
import { Road, RoadEnd } from '../dressing/road';
import { midpoint, xy, xy2arr } from '../helper/xy';
import { findAgent, mutateAgent } from '../loop/loop';
import { Handler, UnitAgent, WithXY } from './../defs';
import { Movement, addSpeedToMovement } from '../helper/movement';
import {
	Target,
	targetFromXY,
	unnestTargets,
	StatefulTarget,
	NestedStatefulTarget,
	mkFindTarget,
	getDistanceToPoint,
	mkFindPath,
} from '../helper/pathfinding';

const isAtPos = (from: WithXY, to: WithXY) => {
	return getDistanceToPoint(from, to) < 1;
};

export const moverHandler: Handler<MoverAgent> = (tick, state, gameState) => {
	const findTarget = mkFindTarget(gameState);
	const findPath = mkFindPath(gameState, Object.values(gameState.roads));

	const isEmpty = () => state.held <= 0;
	const isFull = () => state.held >= state.capacity;

	const isAtTarget = (target: Target) => {
		const to = findTarget(target);
		return isAtPos(state, to);
	};
	const move = (from: WithXY, target: Target) => {
		let speed = 0.05;
		let to = findTarget(target);

		const applyMovement = (movement: Movement) => {
			from.x += movement.right;
			from.x -= movement.left;
			from.y += movement.bottom;
			from.y -= movement.top;
		};

		const movement = addSpeedToMovement(
			{
				left: from.x > to.x ? from.x - to.x : 0,
				right: from.x < to.x ? to.x - from.x : 0,
				top: from.y > to.y ? from.y - to.y : 0,
				bottom: from.y < to.y ? to.y - from.y : 0,
			},
			speed / 2
		);

		applyMovement(movement);
	};

	let moveFrom = findAgent(state.from[0], gameState);
	let moveTo = findAgent(state.to[0], gameState);
	if (state.path.length > 0) {
		const target = state.path[0];
		if (!isAtTarget(target)) {
			move(state, target);
		} else {
			state.path.shift();
		}
	}

	if (isAtPos(state, moveFrom)) {
		state.held += state.loadSpeed;
		mutateAgent<UnitAgent>(moveFrom.id, (prev) => ({
			...prev,
			exports: prev.exports - state.loadSpeed,
		}));
		if (isFull() && state.path.length <= 0) {
			state.path = findPath(state, moveTo);
		}
	}
	if (isAtPos(state, moveTo)) {
		state.held -= state.loadSpeed;
		mutateAgent<UnitAgent>(moveTo.id, (prev) => ({
			...prev,
			emoji: '1212',
			imports: prev.imports + state.loadSpeed,
		}));
		if (isEmpty() && state.path.length <= 0) {
			state.path = findPath(state, moveFrom);
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
