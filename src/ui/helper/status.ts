import { Order } from '../../entity/composables/with-orders';
import { OrderType } from '../../entity/composables/with-orders.df';
import { findEntity } from '../../game/entities';
import { EntityType, GameState, ID } from '../../helper/defs';
import { $t } from '../component/type';
import { useLastKnownGameState } from './../hook/use-game-state';

const getOrderStatus = (entity: Order, gameState: GameState) => {
	if (!entity) {
		return null;
	}
	switch (entity.order) {
		case OrderType.Load:
			return `Load ${entity.load.quantity} boxes of ${$t(
				findEntity(entity.load.product, gameState)
			)}`;
		case OrderType.Unload:
			return `Unload ${entity.load.quantity} boxes of ${$t(
				findEntity(entity.load.product, gameState)
			)}`;
		case OrderType.Move:
			return `Move to ${$t(findEntity(entity.target, gameState))}`;
	}
};

export const getAgentStatus = (entityId: ID, gameState: GameState) => {
	const agent = findEntity(entityId, gameState);
	let txt = 'n/a';
	if (!agent) {
		return txt;
	}
	if (agent.type === EntityType.Vehicle) {
		let status = getOrderStatus(
			findEntity(agent.orders.list[agent.orders.position], gameState) as Order,
			gameState
		);
		if (status) {
			txt = status;
		}
	}
	if (agent.type === EntityType.Order) {
		return getOrderStatus(agent, gameState);
	}
	if (agent.type !== EntityType.Vehicle) {
		return txt;
	}
	if (agent.path.length === 0) {
		txt = `Stuck or loading/unloading`;
	}

	return txt;
};

export const useEntityStatus = (entityId: ID) => {
	const world = useLastKnownGameState((s) => s);
	return getAgentStatus(entityId, world);
};
