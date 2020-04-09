import {
	WithXY,
	WithHandler,
	WithName,
	WithCargo,
	WithColor,
	EntityType,
} from '../helper/defs';
import { HandlerFn } from '../global/handlers';
import { findEntity } from '../game/entity';
import { addCargo } from './composables/with-cargo';
import { Product } from './product';
import { XY } from '../helper/xy';
import { addId, addPosition } from '../helper/generate';
import { makeFactoryName } from '../helper/names';

export const factoryHandler: HandlerFn<UnitAgent> = (
	tick,
	ownState,
	gameState
) => {
	for (let productId of ownState.produces) {
		let entity = findEntity(productId, gameState);
		if (entity && 'yield' in entity) {
			ownState = addCargo(productId, entity.yield / 100, ownState);
		}
	}
	return ownState;
};

export interface UnitAgent
	extends WithXY,
		WithHandler,
		WithName,
		WithCargo,
		WithColor {
	produces: Product['id'][];
	type: EntityType.Unit;
}

export const MkFactory = (
	xy: XY,
	produces: Product['id'][] = []
): UnitAgent => {
	const state: UnitAgent = {
		...addId(),
		...addPosition(xy),
		name: makeFactoryName(),
		cargo: {},
		produces,
		color: 0,
		type: EntityType.Unit,
		emoji: '🏭',
		x: 10,
		y: 10,
		handler: 'factoryHandler',
	};
	return state;
};
