import {
	entityIsPreRoad,
	entityIsRoad,
	PreRoad,
	Road,
	RoadEnd,
} from '../../entity/road';
import { getDistanceToPoint } from '../../helper/pathfinding';
import { XY } from '../../helper/xy';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { mkDirtyStore } from '../helper/dirty-store';
import { getGhostTargetIfAny } from '../helper/ghost';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { getCanvasViewportState } from '../helper/viewport';
import { drawSprite } from '../sprite/sprite';
import { worldToViewport } from './../helper/latlong';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

let dirtyRoads = mkDirtyStore<Road>();
let futureRoads = mkDirtyStore<Road>();

const roadLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const drawRoad = ({ start, end }: { start: XY; end: XY }, rotate) => {
		const { zoom } = getCanvasViewportState();
		let i = 0;
		let length = getDistanceToPoint(start, end);
		let tiles = Math.ceil(length / (2 / (zoom / 10)));
		while (i <= tiles) {
			let rota = 1 % 2 === 0;
			let capOffset = 1 - Math.max(length - 4.25 / (zoom / 10), 0) / length;
			let trimmer = (i / tiles) * (1 - capOffset) + capOffset / 2;
			var midX = start.x + (end.x - start.x) * trimmer;
			var midY = start.y + (end.y - start.y) * trimmer;
			drawRoadTile({ x: midX, y: midY }, rotate + (rota ? 0 : Math.PI));
			i++;
		}
	};

	const drawCap = (xy: XY, scale: number = 1) => {
		let pos = worldToViewport(xy);
		drawSprite(
			ctx,
			'cap',
			{
				scale: 1.5 * scale,
				width: 20,
				height: 20,
				offset: 20,
			},
			pos
		);
	};

	const drawRoadTile = (xy: XY, rotate: number) => {
		let pos = worldToViewport(xy);
		drawSprite(
			ctx,
			'road',
			{
				scale: 1,
				width: 20,
				height: 20,
				offset: 20,
				rotate: Math.PI / 2 + rotate,
			},
			pos
		);
	};

	return ({ state, rendererState }) => {
		ctx.clearRect(0, 0, width, height);

		/*create layers*/
		let roads: Road[] = [];
		let ghosts: Road[] = [];
		let caps: PreRoad[] = [];

		let thisGhost = getGhostTargetIfAny();
		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				if (entity.id === thisGhost?.ghost.id) {
					ghosts.push(entity);
					dirtyRoads.add(entity);
				} else {
					let dirty = dirtyRoads.get(entity.id);
					if (!dirty) {
						roads.push(entity);
					}
				}
			}
		}
		if (!thisGhost) {
			for (let futureRoad of futureRoads.getAll()) {
				roads.push(futureRoad);
			}
		}
		if (thisGhost) {
			if (entityIsPreRoad(thisGhost.ghost)) {
				caps.push({
					...thisGhost.ghost,
					start: rendererState.gameCursor,
				});
			}
			if (entityIsRoad(thisGhost.ghost) && 'roadEnd' in thisGhost) {
				let rd = {
					...thisGhost.ghost,
					[thisGhost.roadEnd]: rendererState.gameCursor,
				} as Road;
				roads.push(rd);
				futureRoads.add(rd);
			}
		}
		/*and draw em!*/
		for (let ghostRoad of ghosts) {
			ctx.globalAlpha = 0.25;
			drawRoad(ghostRoad, angle(ghostRoad.start, ghostRoad.end));
			drawCap(ghostRoad.end);
			drawCap(ghostRoad.start);
			ctx.globalAlpha = 1;
		}
		for (let road of roads) {
			drawRoad(road, angle(road.start, road.end));
		}

		/* now the caps */
		for (let cap of caps) {
			drawCap(cap.start, 1.75);
		}
		for (let road of roads) {
			[RoadEnd.end, RoadEnd.start].forEach((thisEnd) => {
				let scale = 1;
				if (
					thisGhost?.ghost.id === road.id &&
					thisGhost &&
					'roadEnd' in thisGhost &&
					thisEnd === thisGhost.roadEnd
				) {
					scale = 1.75;
				}
				drawCap(road[thisEnd], scale);
			});
		}

		dirtyRoads.onTick();
		futureRoads.onTick();
		return canvas;
	};
};

export { roadLayerRenderer };
