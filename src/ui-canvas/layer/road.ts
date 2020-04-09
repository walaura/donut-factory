import { entityIsRoad } from '../../dressing/road';
import { getDistanceToPoint } from '../../helper/pathfinding';
import { scale as mkScale, XY, xy2arr } from '../../helper/xy';
import { OffScreenCanvasProps, Renderer } from '../helper/renderer';
import { mkDrawSprite } from '../sprite';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';

const angle = (p1: XY, p2: XY) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const roadLayerRenderer = ({
	width,
	height,
	zoom,
}: OffScreenCanvasProps): Renderer => {
	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const drawSprite = mkDrawSprite(ctx);

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
		onFrame: (state) => {
			for (let entity of Object.values(state.entities)) {
				if (entityIsRoad(entity)) {
					drawRoad(entity, angle(entity.start, entity.end));
				}
			}
			return { canvas };
		},
	};
};

export { roadLayerRenderer };
