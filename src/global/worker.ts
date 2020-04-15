import { WorkerScopes } from './global';

const getWorker = (worker: WorkerScopes): Worker => {
	if (self.memory.id !== 'MAIN') {
		throw 'Wrong context';
	}
	if (self.memory.workers && self.memory.workers[worker] === 'NEVER') {
		throw 'cant get this one soz';
	}
	if (
		self.memory.workers &&
		self.memory.workers[worker] != null &&
		self.memory.workers[worker] !== 'NEVER'
	) {
		return self.memory.workers[worker] as Worker;
	}

	self.memory.workers = {
		'CANVAS-WK':
			'OffscreenCanvas' in self ? new Worker('./canvas.wk.donut.js') : 'NEVER',
		'GAME-WK': new Worker('./game.wk.donut.js'),
	};

	return getWorker(worker);
};

export { getWorker };
