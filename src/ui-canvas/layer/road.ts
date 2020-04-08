import { GameState } from './../../helper/defs';
import { getDistanceToPoint } from '../../helper/pathfinding';

import { mkDrawSprite } from '../sprite';
import { XY, scale as mkScale, xy2arr } from '../../helper/xy';
import { entityIsRoad } from '../../dressing/road';
import { OffScreenCanvasProps, Renderer } from '../helper/renderer';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const roadLayerRenderer = ({
	width,
	height,
	zoom,
}: OffScreenCanvasProps): Renderer => {
	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const drawSprite = mkDrawSprite(ctx);

	const scaleArr = (xy: XY) => xy2arr(mkScale(xy, zoom));
	const drawRoad = ({ start, end }: { start: XY; end: XY }, rotate) => {
		const scale = (xy: XY) => mkScale(xy, zoom);

		let i = 0;
		let length = getDistanceToPoint(start, end);
		let tiles = Math.ceil(length / (2 / (zoom / 10)));
		start = scale(start);
		end = scale(end);
		drawSprite('cap', {}, start, 0.5);
		drawSprite('cap', {}, end, 0.5);
		while (i <= tiles) {
			let rota = 1 % 2 === 0;
			let capOffset = 1 - Math.max(length - 3 / (zoom / 10), 0) / length;
			let trimmer = (i / tiles) * (1 - capOffset) + capOffset / 2;
			var midX = start.x + (end.x - start.x) * trimmer;
			var midY = start.y + (end.y - start.y) * trimmer;
			drawSprite(
				'road',
				{ rotate: rotate + Math.PI / 2 + (rota ? 0 : Math.PI) },
				{ x: midX, y: midY },
				0.5
			);
			i++;
		}
	};

	return {
		onFrame: (prevState, state) => {
			for (let entity of Object.values(state.entities)) {
				if (entityIsRoad(entity)) {
					ctx.beginPath();
					ctx.moveTo(...scaleArr(entity.start));
					ctx.lineTo(...scaleArr(entity.end));
					ctx.stroke();
					ctx.beginPath();
					//@ts-ignore
					ctx.arc(...scaleArr(entity.start), 3, 0, 2 * Math.PI);
					//@ts-ignore
					ctx.arc(...scaleArr(entity.end), 3, 0, 2 * Math.PI);
					ctx.fill();

					drawRoad(entity, angle(entity.start, entity.end));
					continue;
				}
			}
			return { canvas, state: undefined };
		},
	};
};

export { roadLayerRenderer };
