import { ID } from './defs';
import { XY } from './xy';
import { RoadEnd } from '../entity/road';

type SharedTargets =
	| {
			entityId: ID;
			roadEnd: RoadEnd;
	  }
	| {
			entityId: ID;
	  }
	| {
			xy: XY;
	  };
export type Target = SharedTargets &
	(
		| {
				isFinal: true;
		  }
		| {}
	);
export type StatefulTarget = Target & {
	score: number;
};
export type NestedStatefulTarget = StatefulTarget & {
	next?: NestedStatefulTarget[];
};
