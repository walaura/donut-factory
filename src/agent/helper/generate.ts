import { BasePlaceableAgent, BaseAgent } from '../../helper/defs';
import { WithID } from '../../helper/defs';
import { XY } from '../../helper/xy';
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
