import {
	EntityType,
	WithHandler,
	WithEmoji,
	WithName,
	Entity,
	BaseEntity,
} from '../helper/defs';
import { addId } from '../helper/generate';

export interface Product extends BaseEntity, WithHandler, WithName, WithEmoji {
	value: number;
	type: EntityType.Product;
	yield: number;
}
export const entityIsProduct = (entity: Entity): entity is Product => {
	return entity.type === EntityType.Product;
};

const MkProduct = (name = 'Widgets', emoji): Product => {
	return {
		...addId(),
		name,
		yield: Math.random(),
		emoji,
		value: 10,
		type: EntityType.Product,
	};
};

export { MkProduct };
