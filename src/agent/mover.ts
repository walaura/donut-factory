import { AgentStateType, BasePlaceableAgent, ID } from '../defs';
import { addSpeedToMovement, Movement } from '../helper/movement';
import {
	getDistanceToPoint,
	mkFindPath,
	mkFindTarget,
	Target,
} from '../helper/pathfinding';
import { xy } from '../helper/xy';
import { addFunds, findAgent, mutateAgent } from '../loop/loop';
import { UnitAgent, XY } from './../defs';
import { addId, addPosition } from './helper/generate';
import { HandlerFn } from '../loop/handlers';

const isAtPos = (from: XY, to: XY) => {
	return getDistanceToPoint(from, to) < 1;
};

export const moverHandler: HandlerFn<MoverAgent> = (tick, state, gameState) => {
	const findTarget = mkFindTarget(gameState);
	const findPath = mkFindPath(gameState, Object.values(gameState.roads));

	const isEmpty = () => state.held <= 0;
	const isFull = () => state.held >= state.capacity;

	const isAtTarget = (target: Target) => {
		const to = findTarget(target);
		return isAtPos(state, to);
	};
	const move = (from: XY, target: Target) => {
		let speed = 0.05;

		if (
			!('roadId' in target) ||
			!('roadId' in state.gross.lastDiscardedPathTarget)
		) {
			speed = speed * state.offroadSpeed;
		}

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
			state.gross.lastDiscardedPathTarget = state.path.shift();
		}
	}

	if (isAtPos(state, moveFrom)) {
		if (!isFull()) {
			state.held += state.loadSpeed;
			mutateAgent<UnitAgent>(moveFrom.id, (prev) => ({
				...prev,
				exports: prev.exports - state.loadSpeed,
			}));
		}
		if (isFull() && state.path.length <= 0) {
			addFunds({
				tx: state.held * 10,
				reason: `Bought ${state.held} goods from ${moveFrom.emoji}`,
			});

			state.path = findPath(state, moveTo);
		}
	}
	if (isAtPos(state, moveTo)) {
		if (!isEmpty()) {
			state.held -= state.loadSpeed;
			mutateAgent<UnitAgent>(moveTo.id, (prev) => ({
				...prev,
				imports: prev.imports + state.loadSpeed,
			}));
		}
		if (isEmpty() && state.path.length <= 0) {
			addFunds({
				tx: state.capacity * 20,
				reason: `Sold ${state.capacity} goods to ${moveTo.emoji}`,
			});

			state.path = findPath(state, moveFrom);
		}
	}

	if (isEmpty() && state.path.length === 0) {
		state.path.push({ agentId: moveFrom.id });
	}

	return state;
};

export interface MoverAgent extends BasePlaceableAgent {
	held: number;
	loadSpeed: number;
	preferenceForRoads: number;
	offroadSpeed: number;
	capacity: number;
	from: ID[];
	to: ID[];
	type: AgentStateType.MOVER;
	path: Target[];
	gross: {
		lastDiscardedPathTarget?: Target;
	};
}

export const MkMover = (from = [], to = []): MoverAgent => {
	return {
		...addId(),
		...addPosition(xy([0, 0])),
		name: 'Bus 1',
		emoji: '🚚',
		held: 0,
		loadSpeed: 0.1,
		capacity: 4,
		preferenceForRoads: 10,
		offroadSpeed: 0.5,
		type: AgentStateType.MOVER,
		from,
		to,
		path: [],
		handler: 'moverHandler',
		gross: {},
	};
};
