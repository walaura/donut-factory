self.memory = {
	id: 'GAME-WK',
	state: null,
	actionQueue: [],
};

import { GameState } from './../helper/defs';
import {
	listenFromWorker,
	MsgActions,
	postFromWorker,
} from '../helper/message';
import { getInitialState, startGame } from '../game/initial';
import { gameLoop } from '../game/loop';
import { expectGameState } from '../global/global';

const fireTock = () => {
	postFromWorker({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(self.memory.state)),
	});
};

listenFromWorker((message) => {
	switch (message.action) {
		case MsgActions.TICK: {
			expectGameState();
			self.memory.state = gameLoop(self.memory.state as GameState);
			fireTock();
			return;
		}
		case MsgActions.START: {
			if (!self.memory) {
				throw 'pls register() first';
			}
			if (message.initialState) {
				self.memory.state = message.initialState;
			} else {
				self.memory.state = getInitialState();
				startGame();
			}
			fireTock();
		}
	}
});
