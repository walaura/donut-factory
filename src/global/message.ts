import { Scopes } from './global';
import { getWorker } from './worker';
import { getMemory } from './memory';
import { GameState, LastKnownCanvasState } from '../helper/defs';
type CanvasAction = import('../wk/canvas.actions').CanvasAction;
type GameAction = import('../wk/game.actions').GameAction;

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
			canvas: HTMLCanvasElement | OffscreenCanvas;
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

const listenFromWorker = <M = WorkerMessage>(onAction: (msg: M) => void) => {
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

type Post = Worker['postMessage'];
type Listen<MessageType> = (cb: (msg: MessageType) => void) => void;
type Transfer<MessageType> = (
	msg: MessageType,
	objects: Transferable[]
) => void;

const fromIsMain = <S>(from): from is Extract<S, 'MAIN'> => from === 'MAIN';

const simulateChannel = <From extends Scopes, To extends Scopes>(
	from: From,
	to: To
): {
	listen: Listen<WorkerMessage>;
	post: Post;
	transfer?: Transfer<WorkerMessage>;
} => {
	let mainMm = getMemory('MAIN');
	const post = (msg) => {
		if (
			mainMm.memory.simulatedWorkersMessageQueue[to as Exclude<Scopes, 'MAIN'>]
		) {
			let q =
				mainMm.memory.simulatedWorkersMessageQueue[
					to as Exclude<Scopes, 'MAIN'>
				];
			for (let cb of q) {
				cb(msg);
			}
		}
	};

	return {
		post,
		transfer: (msg, _) => {
			post(msg);
		},
		listen: (cb) => {
			if (
				!mainMm.memory.simulatedWorkersMessageQueue[
					from as Exclude<Scopes, 'MAIN'>
				]
			) {
				mainMm.memory.simulatedWorkersMessageQueue[
					from as Exclude<Scopes, 'MAIN'>
				] = [];
			}
			mainMm.memory.simulatedWorkersMessageQueue[
				from as Exclude<Scopes, 'MAIN'>
			].push(cb);
		},
	};
};

export const mkChannel = <
	From extends Scopes,
	To extends Exclude<Scopes, From>
>(
	from: From,
	to: To
): {
	listen: Listen<WorkerMessage>;
	post: Post;
	transfer?: Transfer<WorkerMessage>;
} => {
	if (fromIsMain<From>(from)) {
		let worker;
		try {
			worker = getWorker(to as Exclude<Scopes, 'MAIN'>);
		} catch (e) {}
		if (!worker) {
			let mm = getMemory(to);
			if (mm) {
				return simulateChannel(from, to);
			}
			throw `Worker [${to}] not found from [${from}]`;
		}
		return {
			post: (msg) => {
				return worker.postMessage(msg);
			},
			transfer: (msg, transferables) => {
				worker.postMessage(msg, transferables);
			},
			listen: (cb) => listenFromWindow(cb, worker),
		};
	}

	let mm = getMemory(from);
	if ('__isSimulated' in mm.memory) {
		return simulateChannel(from, to);
	}
	return { post: (msg) => self.postMessage(msg), listen: listenFromWorker };
};
