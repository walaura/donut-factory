import { findAgent } from './loop/loop';
import { GameState, ID, WithID } from './helper/defs';
import {
	WorldWorkerMessage,
	MsgActions,
	postFromWorker,
} from './helper/message';
import { getDistanceToPoint, Target } from './helper/pathfinding';
import { XY, scale as mkScale, xy2arr } from './helper/xy';
import { appendWithId } from './agent/helper/generate';
let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let delta = 0;
let selected: Target = { xy: { x: 0, y: 0 } };
let cursor: XY = { x: 20, y: 40 };
let pika;

const grass = '#dcedc8';
const zoom = 10;

const scale = (xy: XY) => mkScale(xy, zoom);
const scaleArr = (xy: XY) => xy2arr(mkScale(xy, zoom));

let width, height;

const bg = () => {
	ctx.fillStyle = grass;
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.fill();

	let rows = new Array(Math.ceil(height / zoom)).fill(null);
	let columns = new Array(Math.ceil(width / zoom)).fill(null);
	ctx.globalAlpha = 0.05;
	rows.forEach((_, i) => {
		ctx.beginPath();
		ctx.moveTo(0, i * zoom - 1);
		ctx.lineTo(width, i * zoom - 1);
		ctx.stroke();
	});
	columns.forEach((_, i) => {
		ctx.beginPath();
		ctx.moveTo(i * zoom - 1, 0);
		ctx.lineTo(i * zoom - 1, height);
		ctx.stroke();
	});
	ctx.globalAlpha = 1;
};

export type RendererState = {
	selected: Target;
};

let animations: { [key in string]: AnimationCell } = {};

const lerp = (start, end, t) => {
	return start * (1 - t) + end * t;
};

interface Animation extends WithID {
	to: number;
	speed: number;
	progress: number;
	lastActive?: number;
	reverses?: boolean;
	then?: () => void;
}
interface AnimationCell extends WithID {
	value: number;
	original: number;
	queue: { [key in string]: Animation };
}

const useAnimatedValue = (original: number, id: ID) => {
	if (!animations[id]) {
		animations[id] = {
			id,
			original,
			value: original,
			queue: {},
		};
	}
	return {
		value: animations[id].value,
		hover: (toId: ID, props: Omit<Animation, 'id' | 'progress'>) => {
			if (!animations[id].queue[toId]) {
				animations[id].queue[toId] = {
					id: toId,
					...props,
					progress: 0,
					lastActive: Date.now(),
					reverses: true,
				};
			} else {
				animations[id].queue[toId].lastActive = Date.now();
			}
		},
		toFixed: (toId: ID, props: Omit<Animation, 'id' | 'progress'>) => {
			if (!animations[id].queue[toId]) {
				animations[id].queue[toId] = {
					id: toId,
					...props,
					progress: 0,
				};
			}
		},
	};
};

interface Feedback extends WithID {
	text: string;
	xy: XY;
}

let feedback: { [key in string]: Feedback } = {};

function draw(prevState: GameState, state: GameState): RendererState {
	delta++;
	const now = Date.now();
	selected = { xy: cursor };

	ctx.clearRect(0, 0, width, height);
	bg();

	// anim
	for (let animation of Object.values(animations)) {
		for (let cell of Object.values(animation.queue)) {
			cell.progress = Math.min(cell.progress + cell.speed, 1);
			animation.value = lerp(animation.value, cell.to, cell.progress);
			if (
				(!cell.lastActive && cell.progress >= 1) ||
				(cell.lastActive && cell.lastActive < now - 30)
			) {
				delete animation.queue[cell.id];
				if (cell.then) {
					cell.then();
				}
				if (cell.reverses) {
					animation.queue['reverse-' + cell.id] = {
						id: 'reverse-' + cell.id,
						to: animation.original,
						speed: cell.speed,
						progress: 0,
						reverses: false,
					};
				}
			}
		}
	}
	ctx.fillStyle = 'black';

	//roads
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
	for (let agent of Object.values(state.agents)) {
		if ('agentId' in selected) {
			break;
		}
		let scaled = scale(agent);
		let distance = getDistanceToPoint(cursor, scaled) / zoom;
		if (distance < 4) {
			selected = {
				agentId: agent.id,
			};
		}
	}

	for (let agent of Object.values(state.agents)) {
		let fontSize = useAnimatedValue(40, 'ag:' + agent.id);
		if ('agentId' in selected && selected.agentId === agent.id) {
			fontSize.hover('hover', {
				to: 50,
				speed: 0.5,
			});
		}

		ctx.filter = `hue-rotate(${agent.color}deg)`;
		ctx.font = fontSize.value + 'px Arial';
		ctx.fillText(agent.emoji, ...xy2arr(scale(agent)));
		ctx.filter = 'none';
	}

	// pop cool text
	if (
		prevState.ledger.length !== state.ledger.length &&
		state.ledger[state.ledger.length - 1].relevantAgents
	) {
		feedback = appendWithId(feedback, {
			xy: findAgent(
				state.ledger[state.ledger.length - 1].relevantAgents[0],
				state
			),
			text: state.ledger[state.ledger.length - 1].tx,
		});
	}

	// overlays
	for (let toast of Object.values(feedback)) {
		const yDelta = useAnimatedValue(0, 'toast:' + toast.id);
		yDelta.toFixed('pop', {
			to: 1,
			speed: 0.0025,
			then: () => {
				delete feedback[toast.id];
			},
		});
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
		ctx = canvas.getContext('2d');
		ctx.scale(ev.data.scale, ev.data.scale);
		width = canvas.width / ev.data.scale;
		height = canvas.height / ev.data.scale;
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
