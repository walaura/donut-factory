import { listenFromWorker, MsgActions } from '../helper/message';
import { CanvasRendererState, CanvasExceptionalMode } from './canvas.defs';
import { Target, GhostTarget } from '../helper/target';
import { XY } from '../helper/xy';

export type CanvasAction =
	| {
			type: 'set-mode';
			to: CanvasExceptionalMode | null;
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
			type: 'toggle-debug-mode';
	  }
	| {
			type: 'set-edit-mode-target';
			to: Target | null;
	  }
	| {
			type: 'set-create-mode-target';
			to: GhostTarget | null;
	  }
	| {
			type: 'set-follow-target';
			to: Target | null;
	  };

export type CanvasReducer<A extends CanvasAction> = (
	action: A,
	canvasState: CanvasRendererState
) => CanvasRendererState | undefined;

const editModeReducer: CanvasReducer<CanvasAction> = (action, state) => {
	switch (action.type) {
		case 'toggle-edit-mode': {
			if (state.mode !== CanvasExceptionalMode.Edit) {
				return {
					...state,
					mode: CanvasExceptionalMode.Edit,
				};
			}
			return {
				...state,
				mode: null,
			};
		}
		case 'set-edit-mode-target': {
			return {
				...state,
				mode: CanvasExceptionalMode.Edit,
				editModeTarget: action.to,
			};
		}
		case 'set-create-mode-target': {
			return {
				...state,
				mode: CanvasExceptionalMode.Add,
				createModeTarget: action.to,
			};
		}
		case 'set-follow-target': {
			return {
				...state,
				followTarget: action.to,
			};
		}
		case 'toggle-debug-mode': {
			return {
				...state,
				debugMode: !state.debugMode,
			};
		}
		case 'pan-delta': {
			return {
				...state,
				followTarget: null,
				viewport: {
					x: state.viewport.x + action.pos.x,
					y: state.viewport.y + action.pos.y,
				},
			};
		}
		case 'set-mode':
			return {
				...state,
				mode: action.to,
				editModeTarget: null,
				createModeTarget: null,
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
