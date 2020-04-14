import { getMemory } from './../../global/memory';
import sum from 'hash-sum';
import { makeCanvasOrOnScreenCanvas } from './offscreen';
import { Size } from '../../helper/xy';

export const makeCanvas = ({ width, height }: Size, hashable: any) => (
	memoizedOperation: (cv: OffscreenCanvas) => OffscreenCanvas
) => {
	let mm = getMemory('CANVAS-WK');
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
