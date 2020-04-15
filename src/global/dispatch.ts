import { getMemory } from './memory';
import { GameAction } from '../wk/game.actions';
import {
	postFromWindow,
	MsgActions,
	CanvasRendererMessage,
	mkChannel,
} from '../helper/message';
import { CanvasAction } from '../wk/canvas.actions';

export const dispatchToGame = (action: GameAction) => {
	try {
		let channel = mkChannel('MAIN', 'GAME-WK');
		channel.post({
			action: MsgActions.PushGameAction,
			value: action,
		});
	} catch (e) {
		let mm = getMemory('GAME-WK');
		mm.memory.actionQueue.push(action);
	}
};

export const dispatchToCanvas = (action: CanvasAction) => {
	try {
		let channel = mkChannel('MAIN', 'CANVAS-WK');
		channel.post({
			action: MsgActions.PushCanvasAction,
			value: action,
		});
	} catch (e) {
		let mm = getMemory('CANVAS-WK');
		mm.memory.actionQueue.push(action);
	}
};
