import { debounce } from '../../helper/debounce';
import { Size } from '../../helper/xy';
import { getMemory } from './../../global/memory';
import { makeCanvasOrOnScreenCanvas } from './offscreen';

const sweep = () => {
	let mm = getMemory('CANVAS-WK');
	let store = mm.memory.store;
	let now = Date.now();
	for (let [id, item] of store.values.entries()) {
		let lastAccess = store.lastAccess.get(item) ?? 9999;
		if (now - lastAccess > 5000) {
			store.values.delete(id);
		}
	}
	console.log(store.values.size);
};

const debouncedSweep = debounce(sweep, 20000);

export const makeCanvas = (
	{ width, height }: Size,
	hashable: (string | number)[] | []
) => (
	memoizedOperation: (cv: OffscreenCanvas) => OffscreenCanvas
): OffscreenCanvas => {
	let mm = getMemory('CANVAS-WK');
	let devmode = mm.memory.state?.debugMode;
	let store = mm.memory.store.values;
	let lastAccess = mm.memory.store.lastAccess;
	let hash =
		(typeof hashable === 'string' ? hashable : hashable.join()) +
		(devmode ? '-dev' : '');
	let storedMaybe = store.get(hash);

	debouncedSweep();

	if (storedMaybe) {
		lastAccess.set(storedMaybe, Date.now());
		return storedMaybe;
	}
	if (!hashable) {
		return memoizedOperation(makeCanvasOrOnScreenCanvas(width, height));
	}
	const result = memoizedOperation(makeCanvasOrOnScreenCanvas(width, height));
	lastAccess.set(result, Date.now());
	store.set(hash, result);
	return store.get(hash) as OffscreenCanvas;
};
