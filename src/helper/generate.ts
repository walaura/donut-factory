import { PlaceableEntity, Entity } from './defs';
import { WithID } from './defs';
import { XY } from './xy';
const uniqid = require('uniqid');

export const appendWithId = <T, What>(
	to: T,
	object: Omit<What, keyof WithID>
): T => {
	const id = uniqid();
	to[id] = { id, ...object };
	return to;
};

export const addId = (): WithID => ({
	id: uniqid(),
});

export const addPosition = ({
	x,
	y,
}: XY): Omit<PlaceableEntity, keyof Entity> => ({
	placeable: true,
	x,
	y,
});