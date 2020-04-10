import { listenFromWorker, MsgActions } from '../helper/message';
import { CanvasRendererState } from './CanvasRendererState';
const deepmerge = require('deepmerge');

export type CanvasAction = {
	type: 'set-edit-mode';
	to: boolean;
};

export type CanvasReducer<A extends CanvasAction> = (
	action: A,
	canvasState: CanvasRendererState
) => CanvasRendererState | undefined;

const reducers: CanvasReducer<CanvasAction>[] = [];

export const commitActions = (
	prevState: CanvasRendererState
): CanvasRendererState => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'Only the canvas thread can commit canvas mutations';
	}

	let canvasState = { ...prevState };

	while (self.memory.actionQueue.length) {
		let action = self.memory.actionQueue.pop();
		if (!action) {
			return canvasState;
		}
		for (let reducer of reducers) {
			let canvasStateMaybe = reducer(action, canvasState);
			if (canvasStateMaybe) {
				canvasState = canvasStateMaybe;
			}
		}
	}

	return canvasState;
};

if (self.memory.id === 'CANVAS-WK') {
	listenFromWorker((message) => {
		if (self.memory.id !== 'CANVAS-WK') {
			throw 'Listening from wrong place';
		}
		if (message.action === MsgActions.PushCanvasAction) {
			self.memory.actionQueue.push(message.value);
		}
	});
}
