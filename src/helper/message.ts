import { CanvasAction } from '../wk/canvas.actions';
import { GameAction } from '../wk/game.actions';
import { GameState, LastKnownCanvasState } from './defs';

export enum MsgActions {
	'SEND_CANVAS' = 'SEND_CANVAS',
	'CANVAS_RESPONSE' = 'CANVAS_RESPONSE',
	'TOCK' = 'TOCK',
	'TICK' = 'TICK',
	'START' = 'START',
	'PushGameAction' = 'COMMIT_ACTION',
	'PushCanvasAction' = 'COMMIT_CV_ACTION',
}

export type CanvasRendererMessage =
	| {
			action: MsgActions.SEND_CANVAS;
			canvas: OffscreenCanvas;
			pixelRatio: number;
	  }
	| {
			action: MsgActions.PushCanvasAction;
			value: CanvasAction;
	  }
	| {
			action: MsgActions.CANVAS_RESPONSE;
			rendererState: LastKnownCanvasState;
	  }
	| {
			action: MsgActions.TOCK;
			state: GameState;
	  };

export type LoopWorkerMessage =
	| {
			action: MsgActions.TOCK;
			state: GameState;
	  }
	| {
			action: MsgActions.TICK;
			state: GameState;
	  }
	| {
			action: MsgActions.START;
			initialState: GameState;
	  }
	| {
			action: MsgActions.PushGameAction;
			value: GameAction;
	  };

export type WorkerMessage = LoopWorkerMessage | CanvasRendererMessage;

export const isMessage = <M = WorkerMessage>(data): data is M => true;

export const listenFromWorker = <M = WorkerMessage>(
	onAction: (msg: M) => void
) => {
	self.addEventListener('message', ({ data }) => {
		if (!isMessage<M>(data)) {
			return;
		}
		onAction(data);
	});
};

export const postFromWorker = <
	M extends LoopWorkerMessage | CanvasRendererMessage = LoopWorkerMessage
>(
	msg: M
) => {
	self.postMessage(msg);
};

export const postFromWindow = <M = WorkerMessage>(msg: M, worker: Worker) => {
	worker.postMessage(msg);
};
export const listenFromWindow = <M = WorkerMessage>(
	onAction: (msg: M) => void,
	worker: Worker
) => {
	worker.onmessage = ({ data }) => {
		if (!isMessage<M>(data)) {
			return;
		}
		onAction(data);
	};
};
