import { UnitAgent, Agent, AgentStateType, XY } from '../defs';
import { addId, addPosition } from './helper/generate';
import { makeFactoryName } from '../helper/names';
import { HandlerFn } from '../loop/handlers';

export const factoryHandler: HandlerFn<UnitAgent> = (
	tick,
	ownState,
	gameState
) => {
	ownState.exports += 0.025;
	return ownState;
};

export const MkFactory = (xy: XY): UnitAgent => {
	const state: UnitAgent = {
		...addId(),
		...addPosition(xy),
		name: makeFactoryName(),
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🏭',
		placeable: true,
		x: 10,
		y: 10,
		handler: 'factoryHandler',
	};
	return state;
};
