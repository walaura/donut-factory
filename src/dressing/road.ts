import { WithID, WithXY } from '../defs';

export enum RoadEnd {
	'start' = 'start',
	'end' = 'end',
}

export interface Road extends WithID {
	id: string;
	name?: string;
	[RoadEnd.start]: WithXY;
	[RoadEnd.end]: WithXY;
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
