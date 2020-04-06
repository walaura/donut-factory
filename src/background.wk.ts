import { listenFromWorker, MsgActions, postFromWorker } from './helper/message';
import { gameLoop, initialState, mutateAgent } from './loop/loop';

let state = initialState;
listenFromWorker((message) => {
	if (message.action === MsgActions.MUTATE_AGENT) {
		mutateAgent(
			message.agentId,
			new Function(`return ${message.mutation}`)(),
			message.context
		);
	}
	if (message.action === MsgActions.TICK) {
		state = gameLoop(state);
		postFromWorker({
			action: MsgActions.TOCK,
			state: JSON.parse(JSON.stringify(state)),
		});
	}
});
