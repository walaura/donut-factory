import { Message, isMessage } from './helper/message';
import renderGame from './render';

navigator.serviceWorker.register('./sw.ts').then(({ active }) => {
	let sw = active;
	navigator.serviceWorker.addEventListener('message', ({ source, data }) => {
		if (source === sw && isMessage(data)) {
			switch (data.action) {
				case 'TOCK':
					renderGame(data.state);
					return;
			}
		}
	});

	const loop = () => {
		sw.postMessage({ action: 'TICK' } as Message);
		requestAnimationFrame(loop);
	};

	loop();
});
