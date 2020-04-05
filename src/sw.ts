import { listenInSw, MsgActions, postFromSw } from './helper/message';
import { gameLoop, initialState } from './loop/loop';

let state = initialState;
listenInSw(({ action }) => {
	state = gameLoop(state);
	if (action !== MsgActions.TICK) {
		return;
	}
	postFromSw({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(state)),
	});
});
