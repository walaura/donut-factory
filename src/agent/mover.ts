import { AgentStateType, BasePlaceableAgent, ID } from '../helper/defs';
import { addSpeedToMovement, Movement } from '../helper/movement';
import {
	getDistanceToPoint,
	mkFindPath,
	mkFindTarget,
	Target,
} from '../helper/pathfinding';
import { xy, XY } from '../helper/xy';
import { addFunds, findAgent, mutateAgent } from '../loop/loop';
import { UnitAgent } from '../helper/defs';
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
		if (!to) return false;
		return isAtPos(state, to);
	};
	const move = (from: XY, target: Target) => {
		let speed = 0.05;

		if (
			!('roadId' in target) ||
			!(
				state.gross.lastDiscardedPathTarget &&
				'roadId' in state.gross.lastDiscardedPathTarget
			)
		) {
			speed = speed * state.offroadSpeed;
		}

		const applyMovement = (movement: Movement) => {
			from.x += movement.right;
			from.x -= movement.left;
			from.y += movement.bottom;
			from.y -= movement.top;
		};
		let to = findTarget(target);
		if (!to) {
			return false;
		}

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
		return true;
	};

	let moveFrom = findAgent(state.from[0], gameState);
	let moveTo = findAgent(state.to[0], gameState);

	if (!moveFrom || !moveTo) {
		console.error('TODO: lost/depot state??');
		return state;
	}

	if (state.path.length > 0) {
		const target = state.path[0];
		if (!isAtTarget(target)) {
			let attempt = move(state, target);
			if (!attempt) {
				//failed to move here, lets break that path off
				state.path.shift();
			}
		} else {
			state.gross.lastDiscardedPathTarget = state.path.shift();
		}
	}

	state.gross.isLoadingOrUnloading = false;
	if (isAtPos(state, moveFrom)) {
		if (!isFull()) {
			state.gross.isLoadingOrUnloading = true;
			state.held += state.loadSpeed;
			mutateAgent<UnitAgent>(moveFrom.id, (prev) => ({
				...prev,
				exports: prev.exports - state.loadSpeed,
			}));
		}
		if (isFull() && state.path.length <= 0) {
			addFunds({
				tx: state.held * -10,
				reason: `Bought ${state.held} goods from ${moveFrom.emoji}`,
			});
			state.gross.isLoadingOrUnloading = false;
			state.path = findPath(state, moveTo);
		}
	}
	if (isAtPos(state, moveTo)) {
		if (!isEmpty()) {
			state.gross.isLoadingOrUnloading = true;
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
				relevantAgents: [state.id, moveTo.id],
			});
			state.gross.isLoadingOrUnloading = false;
			state.path = findPath(state, moveFrom);
		}
	}

	if (!state.gross.isLoadingOrUnloading && state.path.length === 0) {
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
		isLoadingOrUnloading: boolean;
		lastDiscardedPathTarget?: Target;
	};
}

export const MkMover = (from: ID[] = [], to: ID[] = []): MoverAgent => {
	return {
		...addId(),
		...addPosition(xy([0, 0])),
		name: 'Bus 1',
		color: 0,
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
		gross: {
			isLoadingOrUnloading: false,
		},
	};
};
