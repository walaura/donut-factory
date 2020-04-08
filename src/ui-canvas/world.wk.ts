import { entityIsRoad } from '../dressing/road';
import { EntityType, GameState, WithID } from '../helper/defs';
import { appendWithId } from '../helper/generate';
import {
	MsgActions,
	postFromWorker,
	WorldWorkerMessage,
} from '../helper/message';
import { getDistanceToPoint, Target } from '../helper/pathfinding';
import { scale as mkScale, XY, xy2arr } from '../helper/xy';
import { findEntity } from '../loop/loop';
import { mkAgents } from './agent';
import { animationTick, useAnimatedValue, useBouncyValue } from './animation';
import { bgLayerRenderer } from './layer/bg';
import { roadLayerRenderer } from './layer/road';
import { OffScreenCanvasProps, Renderer } from './helper/renderer';

export type RendererState = {
	selected: Target;
};

const lerp = (start, end, t) => {
	return start * (1 - t) + end * t;
};

interface Feedback extends WithID {
	text: string;
	xy: XY;
}

const ZOOM = 20;

const readyCanvas = (
	canvas: OffscreenCanvas,
	{ width, height, zoom }: OffScreenCanvasProps
): Renderer<RendererState> & { setCursor: (xy: XY) => void } => {
	let feedback: { [key in string]: Feedback } = {};
	let mkAgent = mkAgents().mkAgent;
	let selected: Target = { xy: { x: 0, y: 0 } };
	let cursor: XY = { x: 20, y: 40 };

	const bgRenderer = bgLayerRenderer({ width, height, zoom });
	const roadRenderer = roadLayerRenderer({ width, height, zoom });
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const scale = (xy: XY) => mkScale(xy, zoom);

	const setCursor = (newCursor: XY) => {
		cursor = newCursor;
	};

	const onFrame = (prevState: GameState, state: GameState) => {
		selected = { xy: cursor };

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(bgRenderer.onFrame(state, state).canvas, 0, 0);

		// anim
		animationTick();

		ctx.fillStyle = 'black';

		//froads
		ctx.drawImage(roadRenderer.onFrame(prevState, state).canvas, 0, 0);

		//agents
		for (let agent of Object.values(state.entities)) {
			if (!('x' in agent)) {
				continue;
			}
			if ('entityId' in selected) {
				break;
			}
			let scaled = scale(agent);
			let distance = getDistanceToPoint(cursor, scaled) / zoom;
			if (distance < 4) {
				selected = {
					entityId: agent.id,
				};
			}
		}
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
			let prevAgent = prevState.entities[entity.id];
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
			prevState.ledger.length !== state.ledger.length &&
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

		return { canvas, state: { selected } };
	};

	return { onFrame, setCursor };
};

let prevState;
let canvasHandle: ReturnType<typeof readyCanvas> | undefined;
self.onmessage = function (ev) {
	let msg = ev.data as WorldWorkerMessage;
	if (msg.action === MsgActions.SEND_CANVAS) {
		const { canvas } = msg;
		let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.scale(msg.pixelRatio, msg.pixelRatio);
		canvasHandle = readyCanvas(canvas, {
			width: canvas.width / msg.pixelRatio,
			height: canvas.height / msg.pixelRatio,
			zoom: ZOOM,
		});
	}
	if (msg.action === MsgActions.TOCK) {
		if (!canvasHandle) {
			return;
		}
		const frame = canvasHandle.onFrame(prevState || msg.state, msg.state);
		postFromWorker<WorldWorkerMessage>({
			action: MsgActions.CANVAS_RESPONSE,
			rendererState: frame.state,
		});
		prevState = msg.state;
	}
	if (msg.action === MsgActions.SEND_CURSOR) {
		if (!canvasHandle) {
			return;
		}
		canvasHandle.setCursor({ ...msg.pos });
	}
};
