import { WithXY } from './../defs';
import { GameState } from '../defs';

export enum MsgActions {
	'TOCK' = 'TOCK',
	'TICK' = 'TICK',
	'MOVE' = 'MOVE',
}

export type Message =
	| {
			action: MsgActions.TOCK;
			state: GameState;
	  }
	| {
			action: MsgActions.MOVE;
			unit: string;
			to: WithXY;
	  }
	| {
			action: MsgActions.TICK;
	  };

export const isMessage = (data): data is Message => true;

export const listen = (onAction: (msg: Message) => void) => {
	self.addEventListener('message', ({ data }) => {
		if (!isMessage(data)) {
			return;
		}
		onAction(data);
	});
};
