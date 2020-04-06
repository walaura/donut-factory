import { WithXY, ID } from './../defs';
import { GameState } from '../defs';

export enum MsgActions {
	'TOCK' = 'TOCK',
	'TICK' = 'TICK',
	'PAUSE' = 'PAUSE',
	'MUTATE_AGENT' = 'MUTATE_AGENT',
}

export type Message =
	| {
			action: Exclude<MsgActions, MsgActions.TOCK | MsgActions.MUTATE_AGENT>;
	  }
	| {
			action: MsgActions.TOCK;
			state: GameState;
	  }
	| {
			action: MsgActions.MUTATE_AGENT;
			agentId: ID;
			context: any[];
			mutation: string;
	  };

export const isMessage = (data): data is Message => true;

export const listenFromWorker = (onAction: (msg: Message) => void) => {
	self.addEventListener('message', ({ data }) => {
		if (!isMessage(data)) {
			return;
		}
		onAction(data);
	});
};

export const postFromWorker = (msg: Message) => {
	self.postMessage(msg);
};

let wk: Worker | null;
export const registerBackgroundWorkers = () => {
	wk = new Worker('./../background.wk.ts');
};
export const postFromWindow = (msg: Message) => {
	wk.postMessage(msg);
};
export const listenFromWindow = (onAction: (msg: Message) => void) => {
	wk.onmessage = ({ data }) => {
		if (!isMessage(data)) {
			return;
		}
		onAction(data);
	};
};
