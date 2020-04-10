self.memory = {
	id: 'MAIN',
	lastKnownGameState: null,
	lastKnownCanvasState: null,
	workers: null,
};

import {
	listenFromWindow,
	postFromWindow,
	registerBackgroundWorkers,
} from './helper/message';
import { MsgActions } from './helper/message';
import renderSetup from './ui/ui';
import { GameState } from './helper/defs';

registerBackgroundWorkers();
listenFromWindow((data) => {
	switch (data.action) {
		case MsgActions.TOCK:
			if (self.memory.id !== 'MAIN') {
				throw 'no';
			}
			self.memory.lastKnownGameState = data.state;
			return;
	}
});
let initialState = null;
try {
	//@ts-ignore
	initialState = JSON.parse(localStorage.getItem('autosave'));
} catch {}
postFromWindow({ action: MsgActions.START, initialState });

const renderGame = renderSetup();
let lastAutosave = Date.now();
const loopWithState = (state: GameState) => {
	renderGame(state);
	if (Date.now() - lastAutosave > 20000) {
		lastAutosave = Date.now();
		window.localStorage.setItem('autosave', JSON.stringify(state));
	}
	if (!state.paused) {
		postFromWindow({ action: MsgActions.TICK });
	}
};
const loop = () => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}
	if (self.memory.lastKnownGameState) {
		loopWithState(self.memory.lastKnownGameState);
	}
	requestAnimationFrame(loop);
};

loop();
