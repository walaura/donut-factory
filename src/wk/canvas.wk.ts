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

let prevState;
let canvasHandle: ReturnType<typeof renderCanvasLayers> | undefined;
self.onmessage = function (ev) {
	let msg = ev.data as WorldWorkerMessage;
	if (msg.action === MsgActions.SEND_CANVAS) {
		const { canvas } = msg;
		let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
		ctx.scale(msg.pixelRatio, msg.pixelRatio);
		canvasHandle = renderCanvasLayers(canvas, {
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
			rendererState: frame.rendererState,
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
