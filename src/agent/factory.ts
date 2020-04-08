import { ID, WithCargo } from './../helper/defs';
import { Product } from './../dressing/product';
import {
	EntityType,
	WithXY,
	WithHandler,
	WithName,
	WithColor,
} from '../helper/defs';
import { makeFactoryName } from '../helper/names';
import { XY } from '../helper/xy';
import { HandlerFn } from '../loop/handlers';
import { addId, addPosition } from '../helper/generate';
import { findEntity } from '../loop/loop';
import { addCargo } from './with-cargo';

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
