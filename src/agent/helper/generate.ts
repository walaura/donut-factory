import { XY, BasePlaceableAgent, BaseAgent } from './../../defs';
import { WithID } from '../../defs';
const uniqid = require('uniqid');

export const addId = (): WithID => ({
	id: uniqid(),
});

export const addPosition = ({
	x,
	y,
}: XY): Omit<BasePlaceableAgent, keyof BaseAgent> => ({
	placeable: true,
	x,
	y,
});
