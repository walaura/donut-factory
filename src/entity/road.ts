import { EntityType, BaseEntity, Entity } from '../helper/defs';
import { XY } from '../helper/xy';

export enum RoadEnd {
	'start' = 'start',
	'end' = 'end',
}

export interface Road extends BaseEntity {
	type: EntityType.Road;
	[RoadEnd.start]: XY;
	[RoadEnd.end]: XY;
}
export interface PreRoad extends Road {
	pre: true;
}

export const entityIsRoad = (entity: Entity | PreRoad): entity is Road => {
	return entity.type === EntityType.Road && !entityIsPreRoad(entity);
};

export const entityIsPreRoad = (
	entity: Entity | PreRoad
): entity is PreRoad => {
	return (
		entity.type === EntityType.Road && 'pre' in entity && entity.pre === true
	);
};

const MkRoad = (
	name = 'wah',
	start = { x: 0, y: 0 },
	end = { x: 0, y: 0 }
): Road => {
	return {
		id: name + Date.now(),
		emoji: '🛣',
		name,
		start,
		end,
		type: EntityType.Road,
	};
};

export { MkRoad };
