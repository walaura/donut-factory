self.memory = {
	id: 'GAME-WK',
	state: null,
	actionQueue: [],
};

import { getInitialState, startGame } from '../game/initial';
import { gameLoop } from '../game/loop';
import { MsgActions, mkChannel } from '../global/message';
import { listen } from './game.actions';
import { getMemory } from '../global/memory';
import { GameState } from '../helper/defs';
import { diffState } from '../helper/diff';

const fireTock = (diff = true) => {
	if (self.memory.id !== 'GAME-WK') {
		throw 'no';
	}
	let channel = mkChannel('GAME-WK', 'MAIN');
	let state = diff ? diffState({}, self.memory.state) : self.memory.state;
	channel.post({
		action: MsgActions.TOCK,
		state: JSON.parse(JSON.stringify(state)),
	});
};

listen();
let channel = mkChannel('GAME-WK', 'MAIN');
channel.listen((message) => {
	switch (message.action) {
		case MsgActions.TICK: {
			requestAnimationFrame(() => {
				let mm = getMemory('GAME-WK');
				if (!mm.memory.state) {
					throw 'Game is not started yet??';
				}
				mm.memory.state = gameLoop(mm.memory.state);
				fireTock(true);
			});
			return;
		}
		case MsgActions.START: {
			let mm = getMemory('GAME-WK');
			if (message.initialState) {
				mm.memory.state = message.initialState;
			} else {
				mm.memory.state = getInitialState();
				startGame();
			}
			fireTock(false);
		}
	}
});
