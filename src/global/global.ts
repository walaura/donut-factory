import { GameState } from '../helper/defs';
import { Action } from './actions';

export enum WorkerMemoryType {
	'Canvas',
	'Game',
	'Main',
}

export type WorkerMemory =
	| {
			id: 'CANVAS-WK' | 'MAIN';
			state: GameState | null;
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
