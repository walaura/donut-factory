import { AgentStateType } from '../../helper/defs';
import { findAgent } from '../../loop/loop';
import { GameState, ID } from './../../helper/defs';
import { shortNumber } from './format';

export const getAgentStatus = (agentId: ID, gameState: GameState) => {
	const agent = findAgent(agentId, gameState);
	let txt = 'n/a';
	if (agent.type !== AgentStateType.MOVER) {
		return txt;
	}
	if (agent.path.length === 0) {
		txt = `Stuck or loading/unloading`;
	}
	if (agent.held <= 0) {
		const from = findAgent(agent.from[0], gameState);
		txt = `On their way to ${from.emoji} ${from.name}`;
	} else {
		const to = findAgent(agent.to[0], gameState);
		txt = `Delivering ${shortNumber(agent.held)} boxes to
		${to.emoji} ${to.name}`;
	}

	return txt;
};
