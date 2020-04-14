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

export type Workers = {
	game: Worker;
	canvas: Worker;
};

export type MainThreadMemory = {
	id: 'MAIN';
	lastKnownGameState: LastKnownGameState | null;
	lastKnownCanvasState: LastKnownCanvasState | null;
	workers: Workers | null;
	simulatedWorkers: { [key in Exclude<WorkerMemory['id'], 'MAIN'>]?: any };
	ui: {
		boop: () => void;
		pushRoute: (xy: XY, rt: SerializableRoute) => void;
	};
};

export type CanvasWorkerMemory = {
	id: 'CANVAS-WK';
	canvasHandle: ReturnType<typeof renderLayersToCanvas> | undefined;
	lastKnownGameState: LastKnownGameState | null;
	prevKnownGameState: LastKnownGameState | null;
	state: CanvasRendererState | null;
	actionQueue: CanvasAction[];
	store: {
		[key in string]: OffscreenCanvas;
	};
};

export type WorkerMemory =
	| MainThreadMemory
	| CanvasWorkerMemory
	| {
			id: 'GAME-WK';
			state: GameState | null;
			actionQueue: GameAction[];
	  };

export const expectWorkerMemory = () => {
	if (!self.memory) {
		throw 'Must be registered';
	}
};
