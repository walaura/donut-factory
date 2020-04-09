import { listenFromWorker, MsgActions, postFromWorker } from './helper/message';
import { getInitialState, startGame } from './loop/initial';
import { gameLoop, mutateAgent, mutateGame } from './loop/loop';

let state = getInitialState();
listenFromWorker((message) => {
	if (message.action === MsgActions.MUTATE_AGENT) {
		mutateAgent(
			message.entityId,
			typeof message.mutation === 'string'
				? new Function(`return ${message.mutation}`)()
				: message.mutation,
			message.context
		);
	}

	if (message.action === MsgActions.MUTATE_GAME) {
		mutateGame(new Function(`return ${message.mutation}`)(), message.context);
	}
	if (message.action === MsgActions.START) {
		if (message.initialState) {
			state = message.initialState;
		} else {
			startGame();
		}
		state = gameLoop(state);
		postFromWorker({
			action: MsgActions.TOCK,
			state: JSON.parse(JSON.stringify(state)),
		});
	}
	if (message.action === MsgActions.TICK) {
		state = gameLoop(state);
		postFromWorker({
			action: MsgActions.TOCK,
			state: JSON.parse(JSON.stringify(state)),
		});
	}
});
