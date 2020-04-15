import { getMemory, registerGlobal } from '../global/memory';
import { mkChannel, MsgActions, postFromWorker } from '../helper/message';
import { listen } from './canvas.actions';
import { registerCanvasClock } from './canvas.clock';

const fireTock = () => {
	let mm = getMemory('CANVAS-WK');
	let channel = mkChannel('CANVAS-WK', 'MAIN');
	channel.post({
		action: MsgActions.CANVAS_RESPONSE,
		rendererState: JSON.parse(JSON.stringify(mm.memory.state)),
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
		lastKnownGameState: null,
		prevKnownGameState: null,
		actionQueue: [],
		store: {},
	});
	listen();
	let channel = mkChannel('CANVAS-WK', 'MAIN');
	let clock;
	channel.listen((message) => {
		switch (message.action) {
			case MsgActions.TOCK: {
				if (!clock) {
					return;
				}
				let afterTick = clock(message.state);
				fireTock();
				afterTick();
				return;
			}
			case MsgActions.SEND_CANVAS: {
				const { canvas, pixelRatio } = message;
				let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
				ctx.scale(pixelRatio, pixelRatio);
				clock = registerCanvasClock(canvas, {
					width: canvas.width / pixelRatio,
					height: canvas.height / pixelRatio,
				});
				fireTock();
				return;
			}
		}
	});
};
register();

export { register };
export default register;
