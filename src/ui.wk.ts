import { GameState } from './helper/defs';
import {
	RendererWorkerMessage,
	MsgActions,
	postFromWorker,
} from './helper/message';
import { getDistanceToPoint, Target } from './helper/pathfinding';
import { XY, scale as mkScale, xy2arr } from './helper/xy';
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

function draw(state: GameState): RendererState {
	delta++;

	selected = { xy: cursor };

	ctx.clearRect(0, 0, width, height);
	bg();

	// agents
	ctx.fillStyle = 'black';

	for (let road of Object.values(state.roads)) {
		ctx.beginPath();
		ctx.moveTo(...scaleArr(road.start));
		ctx.lineTo(...scaleArr(road.end));
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(...scaleArr(road.start), 3, 0, 2 * Math.PI);
		ctx.arc(...scaleArr(road.end), 3, 0, 2 * Math.PI);
		ctx.fill();
	}

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
		ctx.font = '40px Arial';
		if ('agentId' in selected && selected.agentId === agent.id) {
			ctx.font = '50px Arial';
		}
		ctx.fillText(agent.emoji, ...xy2arr(scale(agent)));
	}

	if (pika) {
		//	ctx.drawImage(pika, 0, 0);
	}
	return { selected };
}

self.onmessage = function (ev) {
	let msg = ev.data as RendererWorkerMessage;
	if (msg.action === MsgActions.SEND_CANVAS) {
		canvas = msg.canvas;
		ctx = canvas.getContext('2d');
		ctx.scale(ev.data.scale, ev.data.scale);
		width = canvas.width / ev.data.scale;
		height = canvas.height / ev.data.scale;
	}
	if (msg.action === MsgActions.TOCK) {
		postFromWorker<RendererWorkerMessage>({
			action: MsgActions.CANVAS_RESPONSE,
			rendererState: draw(msg.state),
		});
	}
	if (msg.action === MsgActions.SEND_CURSOR) {
		cursor = { ...msg.pos };
	}
};
