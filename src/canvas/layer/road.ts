import { entityIsRoad, Road, RoadEnd } from '../../entity/road';
import { getDistanceToPoint } from '../../helper/pathfinding';
import { Target } from '../../helper/target';
import { XY } from '../../helper/xy';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { getCanvasViewportState } from '../helper/viewport';
import { drawSprite } from '../sprite/sprite';
import { worldToViewport } from './../helper/latlong';
import { findEntity } from '../../game/entities';
import { mkDirtyStore } from '../helper/dirty-store';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

let dirtyRoads = mkDirtyStore<Road>();

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

		const getEditModeTargetIfThisRoad = (
			entity: Road
		): (Target & { roadEnd: RoadEnd }) | null => {
			if (
				rendererState.editMode &&
				rendererState.editModeTarget &&
				'entityId' in rendererState.editModeTarget &&
				'roadEnd' in rendererState.editModeTarget &&
				rendererState.editModeTarget.entityId === entity.id
			) {
				return rendererState.editModeTarget;
			}
			return null;
		};

		/*create layers*/
		let roads: Road[] = [];
		let ghosts: Road[] = [];
		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				if (getEditModeTargetIfThisRoad(entity)) {
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
		if (
			'editModeTarget' in rendererState &&
			rendererState.editModeTarget &&
			'entityId' in rendererState.editModeTarget &&
			'roadEnd' in rendererState.editModeTarget
		) {
			let rd = findEntity(rendererState.editModeTarget.entityId, state);
			if (rd) {
				roads.push({
					...rd,
					[rendererState.editModeTarget.roadEnd]: rendererState.gameCursor,
				} as Road);
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
		for (let road of roads) {
			let editModeTarget = getEditModeTargetIfThisRoad(road);
			[RoadEnd.end, RoadEnd.start].forEach((thisEnd) => {
				let scale = 1;
				if (editModeTarget !== null && thisEnd === editModeTarget.roadEnd) {
					scale = 1.75;
				}
				drawCap(road[thisEnd], scale);
			});
		}

		dirtyRoads.onTick();
		return canvas;
	};
};

export { roadLayerRenderer };
