import { GameAction } from '../wk/game.actions';
import {
	postFromWindow,
	MsgActions,
	CanvasRendererMessage,
} from '../helper/message';
import { CanvasAction } from '../wk/canvas.actions';

export const dispatchToGame = (action: GameAction) => {
	if (self.memory.id === 'MAIN') {
		if (self.memory.workers?.game) {
			postFromWindow(
				{
					action: MsgActions.PushGameAction,
					value: action,
				},
				self.memory.workers?.game
			);
		}
		return;
	}
	if (self.memory.id === 'GAME-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit :(';
};

export const dispatchToCanvas = (action: CanvasAction) => {
	if (self.memory.id === 'MAIN') {
		if (self.memory.workers?.canvas) {
			postFromWindow<CanvasRendererMessage>(
				{
					action: MsgActions.PushCanvasAction,
					value: action,
				},
				self.memory.workers?.canvas
			);
		}
		return;
	}
	if (self.memory.id === 'CANVAS-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit :(';
};
