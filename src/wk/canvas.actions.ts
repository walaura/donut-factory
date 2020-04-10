import { listenFromWorker, MsgActions } from '../helper/message';
import { CanvasRendererState } from './canvas.defs';
import { Target } from '../helper/target';

export type CanvasAction =
	| {
			type: 'set-edit-mode';
			to: boolean;
	  }
	| {
			type: 'toggle-edit-mode';
	  }
	| {
			type: 'set-edit-mode-target';
			to: Target;
	  };

export type CanvasReducer<A extends CanvasAction> = (
	action: A,
	canvasState: CanvasRendererState
) => CanvasRendererState | undefined;

const editModeReducer: CanvasReducer<CanvasAction> = (action, state) => {
	switch (action.type) {
		case 'toggle-edit-mode': {
			return {
				...state,
				editMode: !state.editMode,
				editModeTarget: state.editMode ? null : state.editModeTarget,
			};
		}
		case 'set-edit-mode-target': {
			return {
				...state,
				editMode: true,
				editModeTarget: action.to,
			};
		}
		case 'set-edit-mode':
			return action.to === true
				? {
						...state,
						editMode: true,
						editModeTarget: null,
				  }
				: {
						...state,
						editMode: false,
				  };
	}
	return state;
};

const reducers: CanvasReducer<CanvasAction>[] = [editModeReducer];

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
