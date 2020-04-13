self.memory = {
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
};

import {
	MsgActions,
	postFromWorker,
	CanvasRendererMessage,
	listenFromWorker,
} from '../helper/message';
import { renderCanvasLayers } from '../canvas/canvas';
import { CanvasRendererState } from './canvas.defs';

const fireTock = () => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}
	postFromWorker({
		action: MsgActions.CANVAS_RESPONSE,
		rendererState: JSON.parse(JSON.stringify(self.memory.state)),
	});
};

listenFromWorker<CanvasRendererMessage>((message) => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}

	switch (message.action) {
		case MsgActions.TOCK: {
			if (!self.memory.canvasHandle) {
				return;
			}
			self.memory.lastKnownGameState = message.state;
			self.memory.state = self.memory.canvasHandle.onFrame({
				state: self.memory.lastKnownGameState,
				prevState:
					self.memory.prevKnownGameState ?? self.memory.lastKnownGameState,
				rendererState: self.memory.state as CanvasRendererState,
			});
			fireTock();
			self.memory.prevKnownGameState = self.memory.lastKnownGameState;
			return;
		}
		case MsgActions.SEND_CANVAS: {
			const { canvas, pixelRatio } = message;
			let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
			ctx.scale(pixelRatio, pixelRatio);
			self.memory.canvasHandle = renderCanvasLayers(canvas, {
				width: canvas.width / pixelRatio,
				height: canvas.height / pixelRatio,
			});
			fireTock();
			return;
		}
	}
});
