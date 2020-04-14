import {
	MsgActions,
	postFromWorker,
	CanvasRendererMessage,
	listenFromWorker,
} from '../helper/message';
import { renderLayersToCanvas } from '../canvas/canvas';
import { CanvasRendererState } from './canvas.defs';
import { listen } from './canvas.actions';
import { registerGlobal, getMemory } from '../global/memory';

const fireTock = () => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}
	postFromWorker({
		action: MsgActions.CANVAS_RESPONSE,
		rendererState: JSON.parse(JSON.stringify(self.memory.state)),
	});
};

const register = () => {
	registerGlobal('CANVAS-WK', {
		id: 'CANVAS-WK',
		state: {
			selected: { xy: { x: 0, y: 0 } },
			viewport: { x: 0, y: 0 },
			zoom: 20,
			gameCursor: { x: 0, y: 0 },
			screenCursor: { x: 0, y: 0 },
			followTarget: null,
			editModeTarget: null,
			createModeTarget: null,
			mode: null,
			debugMode: false,
		},
		canvasHandle: undefined,
		lastKnownGameState: null,
		prevKnownGameState: null,
		actionQueue: [],
		store: {},
	});
	listen();
};
register();

listenFromWorker<CanvasRendererMessage>((message) => {
	let mm = getMemory('CANVAS-WK');
	switch (message.action) {
		case MsgActions.TOCK: {
			if (!mm.memory.canvasHandle) {
				return;
			}
			mm.memory.lastKnownGameState = message.state;
			mm.memory.state = mm.memory.canvasHandle.onFrame({
				state: mm.memory.lastKnownGameState,
				prevState: mm.memory.prevKnownGameState ?? mm.memory.lastKnownGameState,
				rendererState: mm.memory.state as CanvasRendererState,
			});

			fireTock();
			mm.memory.prevKnownGameState = mm.memory.lastKnownGameState;
			return;
		}
		case MsgActions.SEND_CANVAS: {
			const { canvas, pixelRatio } = message;
			let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
			ctx.scale(pixelRatio, pixelRatio);
			mm.memory.canvasHandle = renderLayersToCanvas(canvas, {
				width: canvas.width / pixelRatio,
				height: canvas.height / pixelRatio,
			});
			fireTock();
			return;
		}
	}
});
export { register };
export default register;
