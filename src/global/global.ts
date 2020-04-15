import {
	GameState,
	LastKnownGameState,
	LastKnownCanvasState,
} from '../helper/defs';
import { GameAction } from '../wk/game.actions';
import { renderLayersToCanvas } from '../canvas/canvas';
import { CanvasRendererState } from '../wk/canvas.defs';
import { CanvasAction } from '../wk/canvas.actions';
import { SerializableRoute } from '../ui/helper/route.defs.ts';
import { XY } from '../helper/xy';

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
