import { WithXY, Entity, BaseEntity, WithEmoji } from './defs';
import { WithID } from './defs';
import { XY } from './xy';
const shortid = require('shortid');

export const appendWithId = <T, What>(
	to: T,
	object: Omit<What, keyof WithID>
): T => {
	const id = shortid.generate();
	to[id] = { id, ...object };
	return to;
};

export const addId = (): WithID => ({
	id: shortid.generate(),
});

export const addPosition = ({
	x,
	y,
}: XY): Omit<WithXY, keyof (BaseEntity & WithEmoji)> => ({
	x,
	y,
});
