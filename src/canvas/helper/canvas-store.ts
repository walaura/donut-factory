import sum from 'hash-sum';
import { makeCanvasOrOnScreenCanvas } from './offscreen';
import { Size } from '../../helper/xy';

export const makeCanvas = ({ width, height }: Size, hashable: any) => (
	memoizedOperation
) => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}
	let store = self.memory.store;
	let memo = sum(hashable);
	if (memo in store) {
		return store[memo];
	}
	if (!hashable) {
		return memoizedOperation(makeCanvasOrOnScreenCanvas(width, height));
	}
	self.memory.store[memo] = memoizedOperation(
		makeCanvasOrOnScreenCanvas(width, height)
	);
	return self.memory.store[memo];
};
