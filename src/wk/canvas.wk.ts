self.memory = {
	id: 'CANVAS-WK',
	state: null,
	prevState: null,
	canvasHandle: undefined,
};

import {
	MsgActions,
	postFromWorker,
	WorldWorkerMessage,
} from '../helper/message';
import { Target } from '../helper/pathfinding';
import { renderCanvasLayers } from '../ui-canvas/helper/renderer';
typeof globalThis;
export type RendererState = {
	selected: Target;
};

const ZOOM = 20;

self.onmessage = function (ev) {
	let msg = ev.data as WorldWorkerMessage;
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'what';
	}
	if (msg.action === MsgActions.TOCK) {
		if (!self.memory.canvasHandle) {
			return;
		}
		const frame = self.memory.canvasHandle.onFrame(
			self.memory.prevState || msg.state,
			msg.state
		);
		postFromWorker<WorldWorkerMessage>({
			action: MsgActions.CANVAS_RESPONSE,
			rendererState: frame.rendererState,
		});
		self.memory.prevState = msg.state;
		return;
	}
	if (msg.action === MsgActions.SEND_CANVAS) {
		const { canvas } = msg;
		let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.scale(msg.pixelRatio, msg.pixelRatio);
		self.memory.canvasHandle = renderCanvasLayers(canvas, {
			width: canvas.width / msg.pixelRatio,
			height: canvas.height / msg.pixelRatio,
			zoom: ZOOM,
		});
	}

	if (msg.action === MsgActions.ENTER_EDIT_MODE) {
		if (!self.memory.canvasHandle) {
			return;
		}
		self.memory.canvasHandle.enterEditMode();
	}
	if (msg.action === MsgActions.SEND_CURSOR) {
		if (!self.memory.canvasHandle) {
			return;
		}
		self.memory.canvasHandle.setCursor({ ...msg.pos });
	}
};
