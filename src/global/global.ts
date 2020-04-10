import {
	GameState,
	LastKnownGameState,
	LastKnownCanvasRendererState,
} from '../helper/defs';
import { GameAction } from '../wk/game.actions';
import { renderCanvasLayers } from '../canvas/canvas';
import { CanvasRendererState } from '../wk/canvas.defs';
import { CanvasAction } from '../wk/canvas.actions';

export type Workers = {
	game: Worker;
	canvas: Worker;
};

export type MainThreadMemory = {
	id: 'MAIN';
	lastKnownGameState: LastKnownGameState | null;
	lastKnownCanvasState: LastKnownCanvasRendererState | null;
	workers: Workers | null;
};

export type WorkerMemory =
	| MainThreadMemory
	| {
			id: 'CANVAS-WK';
			canvasHandle: ReturnType<typeof renderCanvasLayers> | undefined;
			lastKnownGameState: LastKnownGameState | null;
			prevKnownGameState: LastKnownGameState | null;
			state: CanvasRendererState | null;
			actionQueue: CanvasAction[];
	  }
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
