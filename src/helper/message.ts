import { WithXY } from './../defs';
import { GameState } from '../defs';

export enum MsgActions {
	'TOCK' = 'TOCK',
	'TICK' = 'TICK',
	'MOVE' = 'MOVE',
	'PAUSE' = 'PAUSE',
}

export type Message =
	| {
			action: Exclude<MsgActions, MsgActions.TOCK | MsgActions.MOVE>;
	  }
	| {
			action: MsgActions.TOCK;
			state: GameState;
	  }
	| {
			action: MsgActions.MOVE;
			unit: string;
			to: WithXY;
	  };

export const isMessage = (data): data is Message => true;

export const listenInSw = (onAction: (msg: Message) => void) => {
	self.addEventListener('message', ({ data }) => {
		if (!isMessage(data)) {
			return;
		}
		onAction(data);
	});
};

export const postFromSw = (msg: Message) => {
	((self as unknown) as ServiceWorkerGlobalScope).clients
		.matchAll()
		.then((all) => all.map((client) => client.postMessage(msg)));
};
