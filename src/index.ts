import { GameState } from './defs';
import { Message, isMessage, MsgActions } from './helper/message';
import renderGame from './render';

navigator.serviceWorker.register('./sw.ts').then(({ active }) => {
	let sw = active;
	let state: GameState | null = null;
	navigator.serviceWorker.addEventListener('message', ({ source, data }) => {
		if (source === sw && isMessage(data)) {
			switch (data.action) {
				case MsgActions.TOCK:
					state = data.state;
					renderGame(state);
					return;
			}
		}
	});

	const loop = () => {
		sw.postMessage({ action: 'TICK' } as Message);
		if (!state?.paused) {
			requestAnimationFrame(loop);
		}
	};

	loop();
});
