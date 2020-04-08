import { GameState, Entity } from './defs';
import { ID } from './defs';
import { RoadEnd, Road } from '../dressing/road';
import { findEntity } from '../loop/loop';
import { MoverAgent } from '../agent/mover';
import { XY } from './xy';

type SharedTargets =
	| {
			roadId: ID;
			roadEnd: RoadEnd;
	  }
	| {
			entityId: ID;
	  }
	| { xy: XY };

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

const unnestTargets = (
	what: NestedStatefulTarget[]
): { path: StatefulTarget[]; score: number }[] => {
	let paths: StatefulTarget[][] = [];
	const visitor = (
		history: StatefulTarget[] = [],
		what: NestedStatefulTarget[]
	) => {
		for (let w of what) {
			if (w.next) {
				const { next, ...filter } = w;
				visitor([...history, filter], w.next);
			} else {
				const pushable: StatefulTarget[] = [
					...(history as StatefulTarget[]),
					w as StatefulTarget,
				];
				paths.push(pushable);
			}
		}
	};
	visitor([], what);

	return paths
		.map((path) => ({
			path,
			score: path.reduce((acc, { score }) => acc + score, 0),
		}))
		.sort((a, b) => a.score - b.score)
		.splice(0, 4);
};

export const getDistanceToPoint = (a: XY, b: XY) => {
	return Math.hypot(a.x - b.x, a.y - b.y);
};

export const targetFromXY = ({ x, y }: XY): Target => ({ xy: { x, y } });

export const mkFindTarget = (gameState: GameState) => (
	target: Target
): XY | null => {
	if ('roadId' in target) {
		return gameState.roads[target.roadId][target.roadEnd];
	}
	if ('entityId' in target) {
		let entity = findEntity(target.entityId, gameState);
		if (entity && 'x' in entity) {
			return entity;
		}
		return null;
	}
	return target.xy;
};

const getUsableRoadList = (roads: Road[], final: Entity): Target[] => {
	let returnable: Target[] = roads
		.map((road) => [
			{
				roadId: road.id,
				roadEnd: RoadEnd.end,
			},
			{
				roadId: road.id,
				roadEnd: RoadEnd.start,
			},
		])
		.flat();
	returnable.push({ entityId: final.id, isFinal: true });
	return returnable;
};

export const mkFindPath = (gameState: GameState, roads: Road[]) => (
	mover: MoverAgent,
	to: Entity
): Target[] => {
	const findTarget = mkFindTarget(gameState);
	const usableRoads = getUsableRoadList(roads, mover);

	const getDistanceScoreFrom = (
		targets: Target[],
		from: Target
	): StatefulTarget[] => {
		const xy = findTarget(from);
		return targets.map((rd) => {
			const road = findTarget(rd);
			let score = getDistanceToPoint(
				road ?? { x: -Infinity, y: -Infinity },
				xy ?? { x: Infinity, y: Infinity }
			);
			// prefer same road
			if ('roadId' in from && 'roadId' in rd) {
				if (from.roadId === rd.roadId) {
					score = score / mover.preferenceForRoads;
				}
			}
			return { ...rd, score };
		});
	};

	const calculateAllPaths = (
		targets: Target[],
		fromTarget: Target
	): NestedStatefulTarget[] => {
		const score = getDistanceScoreFrom(targets, fromTarget);
		return score.map((target) => {
			if ('isFinal' in target) {
				return target;
			}
			const road = findTarget(target);
			const nextTargets = targets.filter((tg) => findTarget(tg) !== road);
			const next = calculateAllPaths(nextTargets, target);
			return { ...target, next };
		});
	};

	const toTarget = { entityId: to.id };
	const journeys = calculateAllPaths([...usableRoads], toTarget);
	const best = unnestTargets(journeys)[0].path;
	const path = [...best.reverse(), toTarget];
	return path;
};
