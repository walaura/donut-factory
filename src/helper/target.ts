import { ID, Entity, DistributiveOmit } from './defs';
import { XY } from './xy';
import { RoadEnd, Road, PreRoad } from '../entity/road';

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

//@ts-ignore
export type GhostTarget = DistributiveOmit<SharedTargets, 'entityId'> & {
	ghost: Entity | PreRoad;
};

export type StatefulTarget = Target & {
	score: number;
};
export type NestedStatefulTarget = StatefulTarget & {
	next?: NestedStatefulTarget[];
};
