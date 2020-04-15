import { getMemory } from './../../global/memory';
import sum from 'hash-sum';
import { makeCanvasOrOnScreenCanvas } from './offscreen';
import { Size } from '../../helper/xy';

let lastLog = 0;
const debounceLog = (log) => {
	let now = Date.now();
	if (now > lastLog + 1000) {
		console.log(log);
		lastLog = now;
	}
};

export const makeCanvas = ({ width, height }: Size, hashable: any) => (
	memoizedOperation: (cv: OffscreenCanvas) => OffscreenCanvas
) => {
	let mm = getMemory('CANVAS-WK');
	debounceLog(Object.keys(mm.memory.store).length);
	let store = mm.memory.store;
	let memo = sum(hashable);
	if (memo in store) {
		return store[memo];
	}
	if (!hashable) {
		return memoizedOperation(makeCanvasOrOnScreenCanvas(width, height));
	}
	mm.memory.store[memo] = memoizedOperation(
		makeCanvasOrOnScreenCanvas(width, height)
	);
	return mm.memory.store[memo];
};
