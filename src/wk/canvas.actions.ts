import { listenFromWorker, MsgActions } from '../helper/message';
import { CanvasRendererState } from './canvas.defs';
import { Target } from '../helper/target';
import { XY } from '../helper/xy';

export type CanvasAction =
	| {
			type: 'set-edit-mode';
			to: boolean;
	  }
	| {
			type: 'set-screen-cursor';
			pos: XY;
	  }
	| {
			type: 'pan-delta';
			pos: XY;
	  }
	| {
			type: 'toggle-edit-mode';
	  }
	| {
			type: 'set-edit-mode-target';
			to: Target | null;
	  };

export type CanvasReducer<A extends CanvasAction> = (
	action: A,
	canvasState: CanvasRendererState
) => CanvasRendererState | undefined;

const editModeReducer: CanvasReducer<CanvasAction> = (action, state) => {
	switch (action.type) {
		case 'toggle-edit-mode': {
			if (state.editMode) {
				return {
					...state,
					editMode: false,
					editModeTarget: null,
				};
			}
			return {
				...state,
				editMode: true,
				editModeTarget: null,
			};
		}
		case 'set-edit-mode-target': {
			return {
				...state,
				editMode: true,
				editModeTarget: action.to,
			};
		}
		case 'pan-delta': {
			return {
				...state,
				viewport: {
					x: state.viewport.x + action.pos.x,
					y: state.viewport.y + action.pos.y,
				},
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
		case 'set-screen-cursor':
			return { ...state, screenCursor: action.pos };
	}
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
