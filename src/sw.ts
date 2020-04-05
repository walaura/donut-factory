import { listenInSw, MsgActions, postFromSw } from './helper/message';
import { gameLoop, initialState } from './loop/loop';

let state = initialState;
listenInSw(({ action }) => {
	if (action !== MsgActions.TICK) {
		return;
	}
	state = gameLoop(state);
	postFromSw({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(state)),
	});
});
