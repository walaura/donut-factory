self.memory = {
	id: 'CANVAS-WK',
	state: null,
	canvasHandle: undefined,
	lastKnownGameState: null,
	prevKnownGameState: null,
	actionQueue: [],
};

import {
	MsgActions,
	postFromWorker,
	CanvasRendererMessage,
	listenFromWorker,
} from '../helper/message';
import { renderCanvasLayers } from '../canvas/canvas';

const ZOOM = 20;

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
			let state = message.state;
			let prevState = self.memory.prevKnownGameState || state;
			self.memory.state = self.memory.canvasHandle.onFrame(
				prevState,
				state
			).rendererState;
			fireTock();
			self.memory.prevKnownGameState = state;
			return;
		}
		case MsgActions.SEND_CANVAS: {
			const { canvas, pixelRatio } = message;
			let ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
			ctx.scale(pixelRatio, pixelRatio);
			self.memory.canvasHandle = renderCanvasLayers(canvas, {
				width: canvas.width / pixelRatio,
				height: canvas.height / pixelRatio,
				zoom: ZOOM,
			});
			fireTock();
			return;
		}
	}
});

self.onmessage = function (ev) {
	let msg = ev.data as CanvasRendererMessage;
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'what';
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
