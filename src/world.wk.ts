import { appendWithId } from './helper/generate';
import { GameState, WithID, EntityType } from './helper/defs';
import {
	MsgActions,
	postFromWorker,
	WorldWorkerMessage,
} from './helper/message';
import { getDistanceToPoint, Target } from './helper/pathfinding';
import { scale as mkScale, XY, xy2arr } from './helper/xy';
import { findEntity } from './loop/loop';
import {
	animationTick,
	useAnimatedValue,
	useBouncyValue,
} from './ui/canvas/animation';
import { mkBackground } from './ui/canvas/bg';
import { mkAgents } from './ui/canvas/agent';
let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let selected: Target = { xy: { x: 0, y: 0 } };
let cursor: XY = { x: 20, y: 40 };

const zoom = 10;

const scale = (xy: XY) => mkScale(xy, zoom);
const scaleArr = (xy: XY) => xy2arr(mkScale(xy, zoom));

let width, height;
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

let feedback: { [key in string]: Feedback } = {};
let $bg;
let mkAgent;
function draw(prevState: GameState, state: GameState): RendererState {
	selected = { xy: cursor };

	if (!$bg) {
		$bg = mkBackground(width, height, zoom);
	}
	if (!mkAgent) {
		mkAgent = mkAgents().mkAgent;
	}

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage($bg, 0, 0);

	// anim
	animationTick();

	//roads
	ctx.fillStyle = 'black';
	for (let road of Object.values(state.roads)) {
		ctx.beginPath();
		ctx.moveTo(...scaleArr(road.start));
		ctx.lineTo(...scaleArr(road.end));
		ctx.stroke();
		ctx.beginPath();
		//@ts-ignore
		ctx.arc(...scaleArr(road.start), 3, 0, 2 * Math.PI);
		//@ts-ignore
		ctx.arc(...scaleArr(road.end), 3, 0, 2 * Math.PI);
		ctx.fill();
	}

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
	for (let agent of Object.values(state.entities)) {
		if (!('x' in agent)) {
			continue;
		}
		let fontSize = useBouncyValue({ value: 0 }, 'ag:' + agent.id);
		let agentSize = 50;
		if ('entityId' in selected && selected.entityId === agent.id) {
			fontSize.up();
		}
		const { x, y } = scale(agent);
		let flip = false;
		let prevAgent = prevState.entities[agent.id];
		if (agent.type === EntityType.Mover && prevAgent && 'x' in prevAgent) {
			if (agent.x - prevAgent.x >= -0.01) {
				flip = true;
			}
		}
		ctx.drawImage(
			mkAgent(agent, { size: agentSize * 4, flip, scale: fontSize.value }),
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

	return { selected };
}

let prevState;
self.onmessage = function (ev) {
	let msg = ev.data as WorldWorkerMessage;
	if (msg.action === MsgActions.SEND_CANVAS) {
		canvas = msg.canvas;
		ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.scale(msg.pixelRatio, msg.pixelRatio);
		width = canvas.width / msg.pixelRatio;
		height = canvas.height / msg.pixelRatio;
	}
	if (msg.action === MsgActions.TOCK) {
		postFromWorker<WorldWorkerMessage>({
			action: MsgActions.CANVAS_RESPONSE,
			rendererState: draw(prevState || msg.state, msg.state),
		});
		prevState = msg.state;
	}
	if (msg.action === MsgActions.SEND_CURSOR) {
		cursor = { ...msg.pos };
	}
};
