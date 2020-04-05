import { GameState } from './defs';
import { Message, isMessage, MsgActions } from './helper/message';
import renderGame from './render';

navigator.serviceWorker.register('./sw.ts').then(({ active }) => {
	let sw = active;
	let state: GameState | null;

	navigator.serviceWorker.addEventListener('message', ({ source, data }) => {
		if (source === sw && isMessage(data)) {
			switch (data.action) {
				case MsgActions.TOCK:
					state = data.state;
					return;
			}
		}
	});
	sw.postMessage({ action: 'TICK' } as Message);

	const loopWithState = (state: GameState) => {
		renderGame(state);
		if (!state.paused) {
			sw.postMessage({ action: 'TICK' } as Message);
		}
	};

	const loop = () => {
		if (state) {
			loopWithState(state);
		}
		requestAnimationFrame(loop);
	};

	loop();
});
