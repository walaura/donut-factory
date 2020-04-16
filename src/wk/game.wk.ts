self.memory = {
	id: 'GAME-WK',
	state: null,
	actionQueue: [],
};

import { getInitialState, startGame } from '../game/initial';
import { gameLoop } from '../game/loop';
import {
	listenFromWorker,
	MsgActions,
	postFromWorker,
} from '../global/message';
import { listen } from './game.actions';

const fireTock = () => {
	if (self.memory.id !== 'GAME-WK') {
		throw 'no';
	}
	postFromWorker({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(self.memory.state)),
	});
};

listen();
listenFromWorker((message) => {
	if (self.memory.id !== 'GAME-WK') {
		throw 'no';
	}

	switch (message.action) {
		case MsgActions.TICK: {
			if (self.memory.id !== 'GAME-WK' || !self.memory.state) {
				throw 'Game is not started yet??';
			}
			self.memory.state = gameLoop(self.memory.state);
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
