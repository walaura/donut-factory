import { EntityType, UnitAgent } from '../helper/defs';
import { makeFactoryName } from '../helper/names';
import { XY } from '../helper/xy';
import { HandlerFn } from '../loop/handlers';
import { addId, addPosition } from '../helper/generate';

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
		color: 0,
		type: EntityType.Unit,
		emoji: '🏭',
		placeable: true,
		x: 10,
		y: 10,
		handler: 'factoryHandler',
	};
	return state;
};
