import { Action } from '../global/actions';
import { RendererState } from '../wk/canvas.wk';
import { GameState, ID } from './defs';
import { XY } from './xy';

export enum MsgActions {
	'SEND_CANVAS' = 'SEND_CANVAS',
	'CANVAS_RESPONSE' = 'CANVAS_RESPONSE',
	'SEND_CURSOR' = 'SEND_CURSOR',
	'TOCK' = 'TOCK',
	'TICK' = 'TICK',
	'PAUSE' = 'PAUSE',
	'START' = 'START',
	'COMMIT_ACTION' = 'COMMIT_ACTION',
}

export type WorldWorkerMessage =
	| {
			action: MsgActions.SEND_CANVAS;
			canvas: OffscreenCanvas;
			pixelRatio: number;
	  }
	| {
			action: MsgActions.CANVAS_RESPONSE;
			rendererState: RendererState;
	  }
	| {
			action: MsgActions.SEND_CURSOR;
			pos: XY;
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
			action: MsgActions.COMMIT_ACTION;
			value: Action;
	  };

export type WorkerMessage = LoopWorkerMessage | WorldWorkerMessage;

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
	M extends LoopWorkerMessage | WorldWorkerMessage = LoopWorkerMessage
>(
	msg: M
) => {
	self.postMessage(msg);
};

let wk: Worker;
export const registerBackgroundWorkers = () => {
	wk = new Worker('./../wk/game.wk.ts');
};
export const postFromWindow = <M = WorkerMessage>(
	msg: M,
	worker: Worker = wk
) => {
	worker.postMessage(msg);
};
export const listenFromWindow = <M = WorkerMessage>(
	onAction: (msg: M) => void,
	worker: Worker = wk
) => {
	worker.onmessage = ({ data }) => {
		if (!isMessage<M>(data)) {
			return;
		}
		onAction(data);
	};
};
