import { getDistanceToPoint } from '../../helper/pathfinding';
import { scale as mkScale, XY, xy2arr } from '../../helper/xy';
import { OffScreenCanvasProps, Renderer } from '../canvas';
import { mkDrawSprite } from '../sprite/sprite';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { entityIsRoad, RoadEnd } from '../../entity/road';
import { mkAnimations } from '../helper/animation';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const roadLayerRenderer = ({
	width,
	height,
	zoom,
}: OffScreenCanvasProps): Renderer => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const drawSprite = mkDrawSprite(ctx);
	const { animationTick, useBouncyValue } = mkAnimations();

	const drawRoad = (
		{ start, end }: { start: XY; end: XY },
		rotate,
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
			drawSprite(
				'road',
				{ rotate: rotate + Math.PI / 2 + (rota ? 0 : Math.PI) },
				{ x: midX, y: midY },
				zoom
			);
			i++;
		}
		ctx.globalAlpha = 1;
	};

	return {
		onFrame: (state, { rendererState }) => {
			ctx.clearRect(0, 0, width, height);

			for (let entity of Object.values(state.entities)) {
				if (entityIsRoad(entity)) {
					if (
						rendererState.editMode &&
						rendererState.editModeTarget &&
						'entityId' in rendererState.editModeTarget &&
						rendererState.editModeTarget.entityId === entity.id
					) {
					} else {
						drawSprite('cap', { scale: 1 }, entity.start, zoom);
						drawSprite('cap', { scale: 1 }, entity.end, zoom);
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
						drawRoad(ghostRoad, angle(ghostRoad.start, ghostRoad.end), 1);
						[RoadEnd.end, RoadEnd.start].forEach((thisEnd) => {
							let scale = 1;
							if (thisEnd === end) {
								scale = 1.75;
							}
							drawSprite('cap', { scale }, ghostRoad[thisEnd], zoom);
						});
						drawRoad(entity, angle(entity.start, entity.end), 0.5);
					} else {
						drawRoad(entity, angle(entity.start, entity.end));
					}
				}
			}
			return { canvas };
		},
	};
};

export { roadLayerRenderer };
