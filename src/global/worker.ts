import { Workers } from './global';
import { wrongContext } from './invariant';

const getWorker = (worker: keyof Workers) => {
	if (self.memory.id !== 'MAIN') {
		throw wrongContext('MAIN', self.memory.id);
	}

	if (self.memory.workers && self.memory.workers[worker]) {
		return self.memory.workers[worker];
	}

	self.memory.workers = {
		canvas:
			'OffscreenCanvas' in self ? new Worker('./../wk/canvas.wk.ts') : null,
		game: new Worker('./../wk/game.wk.ts'),
	};

	return getWorker(worker);
};

export { getWorker };
