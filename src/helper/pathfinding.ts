import { GameState } from '../defs';
import { ID, WithXY } from '../defs';
import { RoadEnd, Road } from '../dressing/road';
import { findAgent } from '../loop/loop';

export type Target =
	| {
			roadId: ID;
			roadEnd: RoadEnd;
	  }
	| {
			agentId: ID;
	  }
	| { xy: WithXY }
	| { isFinal: true; xy: WithXY };

export type StatefulTarget = Target & {
	debug?: any;
	score: number;
};

export type NestedStatefulTarget = StatefulTarget & {
	next?: NestedStatefulTarget[];
};

export const unnestTargets = (
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

export const getDistanceToPoint = (a: WithXY, b: WithXY) => {
	return Math.hypot(a.x - b.x, a.y - b.y);
};

export const targetFromXY = ({ x, y }: WithXY): Target => ({ xy: { x, y } });

export const mkFindTarget = (gameState: GameState) => (
	target: Target
): WithXY => {
	if ('roadId' in target) {
		return gameState.roads[target.roadId][target.roadEnd];
	}
	if ('agentId' in target) {
		return findAgent(target.agentId, gameState);
	}
	return target.xy;
};

export const mkFindPath = (gameState: GameState, roads: Road[]) => (
	from: WithXY,
	to: WithXY
): Target[] => {
	const findTarget = mkFindTarget(gameState);
	const usableRoads: Target[] = roads
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
	usableRoads.push({ ...targetFromXY(from), isFinal: true });

	const getDistanceScoreFrom = (
		targets: Target[],
		from: Target
	): StatefulTarget[] => {
		const xy = findTarget(from);
		return targets
			.map((rd) => {
				const road = findTarget(rd);
				let score = getDistanceToPoint(road, xy);
				// prefer same road
				if ('roadId' in from && 'roadId' in rd) {
					if (from.roadId === rd.roadId) {
						score = score / 10;
					}
				}
				return { ...rd, score };
			})
			.sort((a, b) => a.score - b.score);
	};

	const addNext = (
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
			const next = addNext(nextTargets, target);
			return { ...target, next };
		});
	};

	const journeys = addNext([...usableRoads], targetFromXY(to));
	const best = unnestTargets(journeys)[0].path;
	const path = [...best.reverse(), targetFromXY(to)];
	return path;
};
