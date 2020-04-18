import { debounce } from '../../helper/debounce';
import { Size } from '../../helper/xy';
import { getMemory } from './../../global/memory';
import { makeCanvasOrOnScreenCanvas } from './offscreen';

const sweep = () => {
	console.log('sweeping');
	let mm = getMemory('CANVAS-WK');
	let store = mm.memory.store.lastAccess;
	let now = Date.now();
	for (let [key, time] of store.entries()) {
		if (now - time > 5000) {
			mm.memory.store.values.delete(key);
			mm.memory.store.lastAccess.delete(key);
		}
	}
};

const debouncedSweep = debounce(sweep, 20000);

export const makeCanvas = (
	{ width, height }: Size,
	hashable: (string | number)[] | []
) => (
	memoizedOperation: (cv: OffscreenCanvas) => OffscreenCanvas
): OffscreenCanvas => {
	let mm = getMemory('CANVAS-WK');
	let store = mm.memory.store.values;
	let lastAccess = mm.memory.store.lastAccess;
	let hash = typeof hashable === 'string' ? hashable : hashable.join();
	let storedMaybe = store.get(hash);

	debouncedSweep();

	if (storedMaybe) {
		lastAccess.set(hash, Date.now());
		return storedMaybe;
	}
	if (!hashable) {
		return memoizedOperation(makeCanvasOrOnScreenCanvas(width, height));
	}
	lastAccess.set(hash, Date.now());
	store.set(hash, memoizedOperation(makeCanvasOrOnScreenCanvas(width, height)));
	return store.get(hash) as OffscreenCanvas;
};
