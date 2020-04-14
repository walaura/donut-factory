import { getMemory } from './../../global/memory';
import sum from 'hash-sum';
import { useEffect, useState } from 'preact/hooks';
import { LastKnownCanvasState } from '../../helper/defs';
import { UIStatePriority, Callback, UpdaterProps } from './use-global-state';

let callbacks: Callback<LastKnownCanvasState, unknown>[] = [];

const subscribeToStateUpdate = <S extends LastKnownCanvasState | any>(
	callback: (S) => void,
	{
		priority = UIStatePriority.Snail,
		query = (s: LastKnownCanvasState) => (s as unknown) as S,
	}: UpdaterProps<LastKnownCanvasState, S> = {}
) => {
	let cbEntry = {
		priority,
		callback,
		query,
		lastCalled: -1,
		hash: '',
	};
	callbacks.push(cbEntry);
	return () => {
		console.log('cleanup fired', callbacks.length);
		callbacks = callbacks.filter((entry) => entry !== cbEntry);
	};
};

export const useLastKnownCanvasState = <S = unknown>(
	query: Required<UpdaterProps<LastKnownCanvasState, S>>['query'],
	priority: UIStatePriority = UIStatePriority.Snail
): S => {
	let mm = getMemory('MAIN');
	const [state, setState] = useState<S>(
		query(mm.memory.lastKnownCanvasState as LastKnownCanvasState)
	);
	useEffect(() => {
		const cleanup = subscribeToStateUpdate(setState, { priority, query });
		return cleanup;
	}, []);
	return state;
};

const hasher = (s: any) => {
	if (typeof s === 'string' || typeof s === 'number') {
		return s;
	}
	return sum(s);
};

export const onReactStateUpdate = (newState: LastKnownCanvasState) => {
	const now = Date.now();

	for (let cb of callbacks) {
		if (now - cb.lastCalled > cb.priority) {
			let response = cb.query(newState);

			let hash = hasher(response);
			if (hash === cb.hash) {
				/*arent we blessed on this fine day*/
				continue;
			}
			cb.hash = hash;
			cb.lastCalled = now;
			cb.callback(response);
		}
	}
};
