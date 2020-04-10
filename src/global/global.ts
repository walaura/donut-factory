import { GameState } from '../helper/defs';
import { Action } from './actions';
import { renderCanvasLayers } from '../ui-canvas/helper/renderer';

export type WorkerMemory =
	| {
			id: 'MAIN';
			state: GameState | null;
	  }
	| {
			id: 'CANVAS-WK';
			canvasHandle: ReturnType<typeof renderCanvasLayers> | undefined;
			state: GameState | null;
			prevState: GameState | null;
	  }
	| {
			id: 'GAME-WK';
			state: GameState | null;
			actionQueue: Action[];
	  };

export const expectWorkerMemory = () => {
	if (!self.memory) {
		throw 'Must be registered';
	}
};

export const expectGameState = () => {
	if (!self.memory.state) {
		throw 'Game is not started yet??';
	}
};
