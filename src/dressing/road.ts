import { WithID, WithName } from '../helper/defs';
import { XY } from '../helper/xy';

export enum RoadEnd {
	'start' = 'start',
	'end' = 'end',
}

export interface Road extends WithID, WithName {
	[RoadEnd.start]: XY;
	[RoadEnd.end]: XY;
}

const MkRoad = (
	name = 'wah',
	start = { x: 0, y: 0 },
	end = { x: 0, y: 0 }
): Road => {
	return {
		id: name + Date.now(),
		name,
		start,
		end,
	};
};

export { MkRoad };
