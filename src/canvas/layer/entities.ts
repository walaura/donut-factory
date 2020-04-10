import { EntityType, WithID } from '../../helper/defs';
import { appendWithId } from '../../helper/generate';
import { scale as mkScale, XY, xy2arr } from '../../helper/xy';
import { mkAgents } from '../sprite/entity';
import { OffScreenCanvasProps, OnFrame, Renderer } from '../canvas';
import { mkAnimations } from '../helper/animation';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { findEntity } from '../../game/entities';
import { entityIsRoad } from '../../entity/road';

const lerp = (start, end, t) => {
	return start * (1 - t) + end * t;
};

interface Feedback extends WithID {
	text: string;
	xy: XY;
}

const entityLayerRenderer = ({
	width,
	height,
	zoom,
}: OffScreenCanvasProps): Renderer => {
	let feedback: { [key in string]: Feedback } = {};
	let mkAgent = mkAgents().mkAgent;

	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const scale = (xy: XY) => mkScale(xy, zoom);
	const { animationTick, useBouncyValue, useAnimatedValue } = mkAnimations();
	const onFrame: OnFrame = (state, { previousGameState, rendererState }) => {
		const { selected } = rendererState;

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'black';

		animationTick();
		//agents
		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				continue;
			}

			if (!('x' in entity)) {
				continue;
			}

			const pixelRatio = 1.5;

			let fontSize = useBouncyValue({ value: 0 }, 'ag:' + entity.id);
			let agentSize = zoom * 2.5 * pixelRatio;
			if ('entityId' in selected && selected.entityId === entity.id) {
				fontSize.up();
			}
			const { x, y } = scale(entity);
			let flip = false;
			let prevAgent = previousGameState.entities[entity.id];
			if (entity.type === EntityType.Vehicle && prevAgent && 'x' in prevAgent) {
				if (entity.x - prevAgent.x >= -0.01) {
					flip = true;
				}
			}
			ctx.drawImage(
				mkAgent(entity, {
					size: agentSize,
					flip,
					scale: lerp(0, 0.5, fontSize.value),
				}),
				x - (agentSize / pixelRatio - zoom) / 2,
				y - (agentSize / pixelRatio - zoom) / 1,
				agentSize / pixelRatio,
				agentSize / pixelRatio
			);
		}

		// pop cool text
		let lastUpdate = state.ledger[state.ledger.length - 1];
		if (
			previousGameState.ledger.length !== state.ledger.length &&
			lastUpdate.relevantAgents
		) {
			const xy = findEntity(lastUpdate.relevantAgents[0], state);
			if (xy) {
				feedback = appendWithId(feedback, {
					xy,
					text: state.ledger[state.ledger.length - 1].tx,
				});
			}
		}

		// overlays
		for (let toast of Object.values(feedback)) {
			const yDelta = useAnimatedValue(
				{
					value: 0,
					speed: 100,
				},
				'toast:' + toast.id
			);
			if (yDelta.value < yDelta.max) {
				yDelta.up();
			} else {
				delete feedback[toast.id];
				yDelta.discard();
			}
			ctx.font = '16px sans-serif';
			ctx.globalAlpha = lerp(2, 0, yDelta.value);
			ctx.fillText(
				toast.text,
				...xy2arr(
					scale({
						x: toast.xy.x,
						y: toast.xy.y + lerp(0, -10, yDelta.value),
					})
				)
			);
			ctx.globalAlpha = 1;
		}

		return { canvas };
	};

	return { onFrame };
};

export { entityLayerRenderer };
