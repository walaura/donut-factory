import { entityIsRoad } from '../../dressing/road';
import { EntityType, WithID } from '../../helper/defs';
import { appendWithId } from '../../helper/generate';
import { scale as mkScale, XY, xy2arr } from '../../helper/xy';
import { findEntity } from '../../loop/loop';
import { mkAgents } from '../agent';
import { OffScreenCanvasProps, OnFrame, Renderer } from '../helper/renderer';
import { mkAnimations } from './../animation';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';

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

			let fontSize = useBouncyValue({ value: 0 }, 'ag:' + entity.id);
			let agentSize = 50;
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
				mkAgent(entity, { size: agentSize * 4, flip, scale: fontSize.value }),
				x - agentSize / 2,
				y - agentSize / 2,
				agentSize,
				agentSize
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
