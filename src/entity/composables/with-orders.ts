import {
	ID,
	BaseEntity,
	EntityType,
	Entity,
	WithOrders,
} from '../../helper/defs';
import { addId } from '../../helper/generate';
import { GameReducer } from '../../wk/game.actions';
import { dispatchToGame } from '../../global/dispatch';
import { OrderType } from './with-orders.df';

export interface Load {
	product: ID;
	quantity: number;
	wait: boolean;
}

type PossibleOrders =
	| {
			order: OrderType.Load;
			load: Load;
	  }
	| {
			order: OrderType.Unload;
			load: Load;
	  }
	| {
			order: OrderType.Move;
			target: ID;
	  };

export type Order = BaseEntity &
	PossibleOrders & {
		emoji: '📥';
		type: EntityType.Order;
	};

export const entityIsOrder = (entity: Entity): entity is Order => {
	return entity.type === EntityType.Order;
};

export interface OrderQueue {
	position: number;
	list: ID[];
	state: {
		elapsed: number;
		cargoLoaded: number;
	};
}

const moveToNextOrder = <S extends WithOrders>(state: S): S => {
	state.orders.state.elapsed = 0;
	state.orders.state.cargoLoaded = 0;
	state.orders.position += 1;
	return state;
};

export const cancelCurrentOrder = <S extends WithOrders>(state: S): S => {
	return moveToNextOrder(state);
};

export const deliverCurrentOrder = <S extends WithOrders>(state: S): S => {
	return moveToNextOrder(state);
};

const addOrder = (): Omit<Order, 'order' | 'id'> => ({
	name: 'Order',
	emoji: '📥',
	type: EntityType.Order,
});

export const mkMoveOrder = (target: ID): Order => ({
	...addId(),
	...addOrder(),
	order: OrderType.Move,
	target,
});

export const mkLoadOrder = (load: Load): Order => ({
	...addId(),
	...addOrder(),
	order: OrderType.Load,
	load,
});

export const mkUnloadOrder = (load: Load): Order => ({
	...addId(),
	...addOrder(),
	order: OrderType.Unload,
	load,
});

export const linkOrder = (entityId: ID, orderId: ID) => {
	dispatchToGame({
		type: 'link-order',
		entityId,
		orderId,
	});
};

export const clearOrders = (entityId: ID) => {
	dispatchToGame({
		type: 'merge-entity',
		entityId,
		mergeable: {
			orders: {
				list: [],
			},
		},
	});
};

export type OrderAction = {
	type: 'link-order';
	entityId: ID;
	orderId: ID;
};

export const orderReducer: GameReducer<OrderAction> = (
	action,
	{ onEntity }
) => {
	switch (action.type) {
		case 'link-order': {
			return onEntity<Entity & WithOrders>(action.entityId, (prev) => ({
				orders: {
					list: [...prev.orders.list, action.orderId],
				},
			}));
		}
	}
};
