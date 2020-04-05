import { listenInSw, MsgActions, postFromSw } from './helper/message';
import { gameLoop, initialState, mutateAgent } from './loop/loop';

let state = initialState;
listenInSw((message) => {
	if (message.action === MsgActions.MUTATE_AGENT) {
		mutateAgent(
			message.agentId,
			new Function(`return ${message.mutation}`)(),
			message.context
		);
	}
	if (message.action !== MsgActions.TICK) {
		return;
	}
	state = gameLoop(state);
	postFromSw({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(state)),
	});
});
