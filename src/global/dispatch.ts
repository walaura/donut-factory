import { Action } from './actions';
import { postFromWindow, MsgActions } from '../helper/message';

export const dispatch = (action: Action) => {
	if (self.memory.id === 'MAIN') {
		postFromWindow({
			action: MsgActions.COMMIT_ACTION,
			value: action,
		});
		return;
	}
	if (self.memory.id === 'GAME-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit yet :(';
};
