import { GameState } from './defs';
import {
	listenFromWindow,
	MsgActions,
	postFromWindow,
	registerBackgroundWorkers,
} from './helper/message';
import renderGame from './ui/ui';

let state: GameState | null;

registerBackgroundWorkers();
listenFromWindow((data) => {
	switch (data.action) {
		case MsgActions.TOCK:
			state = data.state;
			return;
	}
});
let initialState = null;
try {
	initialState = JSON.parse(localStorage.getItem('autosave'));
} catch {}
postFromWindow({ action: MsgActions.START, initialState });

let lastAutosave = Date.now();
const loopWithState = (state: GameState) => {
	renderGame(state);
	if (Date.now() - lastAutosave > 2000) {
		lastAutosave = Date.now();
		window.localStorage.setItem('autosave', JSON.stringify(state));
	}
	if (!state.paused) {
		postFromWindow({ action: MsgActions.TICK });
	}
};
const loop = () => {
	if (state) {
		loopWithState(state);
	}
	requestAnimationFrame(loop);
};

loop();
