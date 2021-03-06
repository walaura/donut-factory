import { addEntity, findEntity } from '../game/entities';
import { addFunds } from '../game/ledger';
import { dispatchToGame } from '../global/dispatch';
type HandlerFn = import('../global/handlers').HandlerFn;
import {
	entityHasXY,
	EntityType,
	GameState,
	ID,
	WithCargo,
	WithColor,
	WithHandler,
	WithOrders,
	WithPath,
	WithXY,
} from '../helper/defs';
import { addId, addPosition } from '../helper/generate';
import { addSpeedToMovement, applyMovement, isAtPos } from '../helper/movement';
import { makeConsumerName } from '../helper/names';
import { mkFindPath, mkFindTarget } from '../helper/pathfinding';
import { Target } from '../helper/target';
import { xy } from '../helper/xy';
import { chaseLinear } from './../helper/movement';
import { buildCargoStore, getCargoQuantity } from './composables/with-cargo';
import {
	cancelCurrentOrder,
	deliverCurrentOrder,
	mkLoadOrder,
	mkMoveOrder,
	mkUnloadOrder,
	Order,
} from './composables/with-orders';
import { OrderType } from './composables/with-orders.df';
import { popPath } from './composables/with-path';
import { entityIsProduct } from './product';
import { entityIsRoad } from './road';

export const mkHeldTotal = (state: Vehicle) =>
	Object.keys(state.cargo)
		.map((productId) => getCargoQuantity(productId, state))
		.reduce((a, b) => a + b, 0);

const mkMove = (state: Vehicle, gameState: GameState) => (
	from: Vehicle,
	target: Target
): Vehicle | null => {
	const findTarget = mkFindTarget(gameState);
	let speed = 0.05;
	let fromPath = state.pathHistory[0] ?? null;
	if (!('roadEnd' in target) || !(fromPath && 'roadEnd' in fromPath)) {
		speed = speed * state.offroadSpeed;
	}

	let to = findTarget(target);
	if (!to) {
		return null;
	}

	const movement = addSpeedToMovement(chaseLinear(from, to), speed / 2);
	from = applyMovement(from, movement);
	return from;
};

export const moverHandler: HandlerFn<Vehicle> = (tick, state, gameState) => {
	const findTarget = mkFindTarget(gameState);
	const move = mkMove(state, gameState);
	const findPath = mkFindPath(
		gameState,
		Object.values(gameState.entities).filter(entityIsRoad)
	);

	const heldTotal = mkHeldTotal(state);

	const isAtTarget = (target: Target) => {
		const to = findTarget(target);
		if (!to) return false;
		return isAtPos(state, to);
	};

	const currentOrder = findEntity(
		state.orders.list[state.orders.position],
		gameState
	);

	if (!currentOrder || !('order' in currentOrder)) {
		if (state.orders.position >= state.orders.list.length) {
			state.orders.position = 0;
			return state;
		}
		return cancelCurrentOrder(state);
	}

	state.orders.state.elapsed += 1;
	switch (currentOrder.order) {
		case OrderType.Move: {
			/* validatorz */
			let moveTo = findEntity(currentOrder.target, gameState);
			if (!moveTo || !entityHasXY(moveTo)) {
				return cancelCurrentOrder(state);
			}

			/* is it there? */
			if (isAtPos(state, moveTo)) {
				state.insideOf = moveTo.id;
				return deliverCurrentOrder(state);
			}

			/* is it still? let's create a path */
			if (state.path.length === 0) {
				state.insideOf = undefined;
				state.path = findPath(state, moveTo);
				break;
			}

			/* follow the path which we either 
			just created OR is stale but 
			thats okay it'll just keep rolling */
			const nextPath = state.path[0];
			if (isAtTarget(nextPath)) {
				popPath(state);
				break;
			}
			let attempt = move(state, nextPath);
			if (attempt == null) {
				/*failed to move here, lets break that path off and carry on*/
				popPath(state);
				break;
			}
			state = attempt;
			break;
		}
		case OrderType.Unload:
		case OrderType.Load: {
			/* validatorz */
			if (!state.insideOf) {
				return cancelCurrentOrder(state);
			}
			const product = findEntity(currentOrder.load.product, gameState);
			const depot = findEntity(state.insideOf, gameState);
			if (
				!product ||
				!entityIsProduct(product) ||
				!depot ||
				!('cargo' in depot)
			) {
				return cancelCurrentOrder(state);
			}

			state = buildCargoStore(product.id, state);
			const isUnloading = currentOrder.order === OrderType.Unload;
			const allCargo = getCargoQuantity(currentOrder.load.product, state);
			const loadQuantity = currentOrder.load.quantity;
			const cargoLoadedThisOrder = Math.abs(state.orders.state.cargoLoaded);

			const isReadyToPay = isUnloading
				? allCargo < 0 || cargoLoadedThisOrder >= loadQuantity
				: allCargo >= loadQuantity ||
				  cargoLoadedThisOrder >= loadQuantity ||
				  heldTotal >= state.capacity;

			/* pay up buttercup */
			if (isReadyToPay) {
				const txMultiplier = isUnloading ? 1.1 : -0.75;
				const reason = isUnloading
					? `Sold ${state.capacity} ${product.name}s to ${depot.emoji}`
					: `Bought ${state.capacity} ${product.name}s from ${depot.emoji}${depot.name}`;

				addFunds({
					tx: cargoLoadedThisOrder * product.value * txMultiplier,
					reason,
					relevantAgents: [state.id],
				});
				return deliverCurrentOrder(state);
			}

			/* else lets fill it up */
			const speed = isUnloading ? state.loadSpeed * -1 : state.loadSpeed;
			/* mutate both so they stay in sync */
			state.orders.state.cargoLoaded += speed;
			dispatchToGame({
				type: 'add-cargo',
				entityId: depot.id,
				productId: product.id,
				quantity: speed * -1,
			});
			dispatchToGame({
				type: 'add-cargo',
				entityId: state.id,
				productId: product.id,
				quantity: speed,
			});
			break;
		}
	}
	return state;
};

export interface Vehicle
	extends WithXY,
		WithHandler,
		WithCargo,
		WithColor,
		WithPath,
		WithOrders {
	loadSpeed: number;
	preferenceForRoads: number;
	offroadSpeed: number;
	capacity: number;
	type: EntityType.Vehicle;
	insideOf?: ID;
}

export const MkMover = (transports?: ID, from?: ID, to?: ID): Vehicle => {
	//@ts-ignore
	const orders: Order[] = [
		from && mkMoveOrder(from),
		transports &&
			mkLoadOrder({
				product: transports,
				quantity: 2,
				wait: true,
			}),
		to && mkMoveOrder(to),
		transports &&
			mkUnloadOrder({
				product: transports,
				quantity: 2,
				wait: true,
			}),
		,
	].filter(Boolean);

	orders.forEach((order: Order) => {
		return addEntity(order);
	});

	return {
		...addId(),
		...addPosition(xy([0, 0])),
		name: makeConsumerName() + `'s truck`,
		color: 0,
		emoji: '🚚',
		cargo: {},
		orders: {
			position: 0,
			state: {
				elapsed: 0,
				cargoLoaded: 0,
			},
			list: orders.map(({ id }) => id),
		},
		loadSpeed: 0.025,
		capacity: 4,
		preferenceForRoads: 10,
		offroadSpeed: 0.5,
		type: EntityType.Vehicle,
		path: [],
		pathHistory: [],
		handler: 'moverHandler',
	};
};
