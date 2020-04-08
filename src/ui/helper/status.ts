import { EntityType } from '../../helper/defs';
import { findEntity } from '../../loop/loop';
import { GameState, ID } from './../../helper/defs';
import { shortNumber } from './format';

export const getAgentStatus = (entityId: ID, gameState: GameState) => {
	const agent = findEntity(entityId, gameState);
	let txt = 'n/a';
	if (!agent) {
		return txt;
	}
	if (agent.type !== EntityType.Mover) {
		return txt;
	}
	if (agent.path.length === 0) {
		txt = `Stuck or loading/unloading`;
	}
	if (agent.held <= 0) {
		const from = findEntity(agent.from[0], gameState);
		from && (txt = `On their way to ${from.emoji} ${from.name}`);
	} else {
		const to = findEntity(agent.to[0], gameState);
		to &&
			(txt = `Delivering ${shortNumber(agent.held)} boxes to
		${to.emoji} ${to.name}`);
	}

	return txt;
};
