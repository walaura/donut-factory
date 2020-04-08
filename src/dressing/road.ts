import { BaseEntity, EntityType, Entity } from '../helper/defs';
import { XY } from '../helper/xy';

export enum RoadEnd {
	'start' = 'start',
	'end' = 'end',
}

export interface Road extends BaseEntity {
	[RoadEnd.start]: XY;
	[RoadEnd.end]: XY;
	type: EntityType.Road;
}
export const entityIsRoad = (entity: Entity): entity is Road => {
	return entity.type === EntityType.Road;
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
