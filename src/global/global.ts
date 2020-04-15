import {
	GameState,
	LastKnownCanvasState,
	LastKnownGameState,
} from '../helper/defs';
import { XY } from '../helper/xy';

type GameAction = import('../wk/game.actions').GameAction;
type CanvasAction = import('../wk/canvas.actions').CanvasAction;
type CanvasRendererState = import('../wk/canvas.defs').CanvasRendererState;
type SerializableRoute = import('../ui/helper/route').SerializableRoute;

export type Scopes = WorkerMemory['id'];
export type WorkerScopes = Exclude<Scopes, 'MAIN'>;

export type MainThreadMemory = {
	id: 'MAIN';
	lastKnownGameState: LastKnownGameState | null;
	lastKnownCanvasState: LastKnownCanvasState | null;
	workers: { [key in WorkerScopes]: Worker | 'NEVER' } | null;
	simulatedWorkers: { [key in WorkerScopes]?: any };
	simulatedWorkersMessageQueue: { [key in WorkerScopes]?: any };
	ui: {
		boop: () => void;
		pushRoute: (xy: XY, rt: SerializableRoute) => void;
	};
};

export type CanvasWorkerMemory = {
	id: 'CANVAS-WK';
	lastKnownGameState: LastKnownGameState | null;
	prevKnownGameState: LastKnownGameState | null;
	state: CanvasRendererState | null;
	actionQueue: CanvasAction[];
	store: {
		[key in string]: OffscreenCanvas;
	};
};

export type WorkerMemory = ({ __isSimulated: true } | {}) &
	(
		| MainThreadMemory
		| CanvasWorkerMemory
		| {
				id: 'GAME-WK';
				state: GameState | null;
				actionQueue: GameAction[];
		  }
	);

export const expectWorkerMemory = () => {
	if (!self.memory) {
		throw 'Must be registered';
	}
};
