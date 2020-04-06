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
postFromWindow({ action: MsgActions.TICK });

const loopWithState = (state: GameState) => {
	renderGame(state);
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
