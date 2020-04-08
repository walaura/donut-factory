import {
	WithID,
	WithName,
	PlaceableEntity,
	HandleableEntity,
	EntityType,
	WithEmoji,
} from '../helper/defs';
import { XY } from '../helper/xy';
import { addId } from '../helper/generate';

export enum RoadEnd {
	'start' = 'start',
	'end' = 'end',
}

export interface Product extends HandleableEntity, WithName, WithEmoji {
	value: number;
	type: EntityType.Product;
}

const MkProduct = (name = 'Widgets', emoji): Product => {
	return {
		...addId(),
		name,
		emoji,
		value: 10,
		type: EntityType.Product,
	};
};

export { MkProduct };
