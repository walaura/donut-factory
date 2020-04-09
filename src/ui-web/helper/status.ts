import { EntityType } from '../../helper/defs';
import { findEntity } from '../../loop/loop';
import { GameState, ID } from './../../helper/defs';
import { shortNumber } from './format';
import { mkHeldTotal } from '../../agent/vehicle';
import { OrderType } from '../../agent/with-orders';
import { $t } from '../components/type';

export const getAgentStatus = (entityId: ID, gameState: GameState) => {
	const agent = findEntity(entityId, gameState);
	let txt = 'n/a';
	if (!agent) {
		return txt;
	}
	if (agent.type === EntityType.Order) {
		switch (agent.order) {
			case OrderType.Load:
				return `Load ${agent.load.quantity} boxes of ${$t(
					findEntity(agent.load.product, gameState)
				)}`;
			case OrderType.Unload:
				return `Unload ${agent.load.quantity} boxes of ${$t(
					findEntity(agent.load.product, gameState)
				)}`;
			case OrderType.Move:
				return `Move to ${$t(findEntity(agent.target, gameState))}`;
		}
	}
	if (agent.type !== EntityType.Vehicle) {
		return txt;
	}
	if (agent.path.length === 0) {
		txt = `Stuck or loading/unloading`;
	}

	return txt;
};