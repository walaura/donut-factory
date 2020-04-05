import { UnitAgent, Handler, Agent, AgentStateType } from '../defs';

export const factoryHandler: Handler<UnitAgent> = (
	tick,
	ownState,
	gameState
) => {
	ownState.exports += 0.025;
	return ownState;
};

export const MkFactory = (): Agent => {
	const state: UnitAgent = {
		id: 'TEST_Factory',
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🏭',
		x: 10,
		y: 10,
		handler: 'factoryHandler',
	};
	return state;
};
