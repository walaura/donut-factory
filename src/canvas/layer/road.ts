import { width, height } from './../sprite/chip';
import { worldToViewport } from './../helper/latlong';
import { entityIsRoad, RoadEnd } from '../../entity/road';
import { getDistanceToPoint } from '../../helper/pathfinding';
import { XY } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { Sprite, drawSprite } from '../sprite/sprite';
import { Scaler, drawScaled } from '../sprite/scaler';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const roadLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const drawRoad = (
		{ start, end }: { start: XY; end: XY },
		rotate,
		{ zoom, viewport }: CanvasRendererStateViewport,
		alpha = 1
	) => {
		let i = 0;
		let length = getDistanceToPoint(start, end);
		let tiles = Math.ceil(length / (2 / (zoom / 10)));
		ctx.globalAlpha = alpha;
		while (i <= tiles) {
			let rota = 1 % 2 === 0;
			let capOffset = 1 - Math.max(length - 4.25 / (zoom / 10), 0) / length;
			let trimmer = (i / tiles) * (1 - capOffset) + capOffset / 2;
			var midX = start.x + (end.x - start.x) * trimmer;
			var midY = start.y + (end.y - start.y) * trimmer;
			drawRoadTile({ x: midX, y: midY }, rotate + (rota ? 0 : Math.PI));
			i++;
		}
		ctx.globalAlpha = 1;
	};

	const drawCap = (xy: XY, scale: number = 1) => {
		let pos = worldToViewport(xy);
		drawSprite(
			ctx,
			'cap',
			{
				scale: 1.5,
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
		const { zoom } = rendererState;
		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				if (
					rendererState.editMode &&
					rendererState.editModeTarget &&
					'entityId' in rendererState.editModeTarget &&
					rendererState.editModeTarget.entityId === entity.id
				) {
				} else {
					drawCap(entity.start);
					drawCap(entity.end);
				}
			}
		}

		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				if (
					rendererState.editMode &&
					rendererState.editModeTarget &&
					'entityId' in rendererState.editModeTarget &&
					'roadEnd' in rendererState.editModeTarget &&
					rendererState.editModeTarget.entityId === entity.id
				) {
					let end = rendererState.editModeTarget.roadEnd;
					let to = rendererState.gameCursor;

					let ghostRoad = { ...entity, [end]: to };
					drawRoad(
						ghostRoad,
						angle(ghostRoad.start, ghostRoad.end),
						rendererState
					);
					[RoadEnd.end, RoadEnd.start].forEach((thisEnd) => {
						let scale = 1;
						if (thisEnd === end) {
							scale = 1.75;
						}
						drawCap(ghostRoad[thisEnd], scale);
					});
					drawRoad(
						entity,
						angle(entity.start, entity.end),
						rendererState,
						0.25
					);
				} else {
					drawRoad(entity, angle(entity.start, entity.end), rendererState);
				}
			}
		}
		return canvas;
	};
};

export { roadLayerRenderer };
