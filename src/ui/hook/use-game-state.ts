import sum from 'hash-sum';
import { useEffect, useState } from 'preact/hooks';
import { findEntity } from '../../game/entities';
import { ID, LastKnownGameState } from '../../helper/defs';
import { UIStatePriority, Callback, UpdaterProps } from './use-global-state';

let callbacks: Callback<LastKnownGameState, unknown>[] = [];

const subscribeToStateUpdate = <S extends LastKnownGameState | any>(
	callback: (S) => void,
	{
		priority = UIStatePriority.Snail,
		query = (s: LastKnownGameState) => (s as unknown) as S,
	}: UpdaterProps<LastKnownGameState, S> = {}
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
		callbacks = callbacks.filter((entry) => entry !== cbEntry);
	};
};

export const useLastKnownEntityState = (
	entityId: ID,
	priority: UIStatePriority = UIStatePriority.Snail
) => useLastKnownGameState((s) => findEntity(entityId, s), priority);

export const useLastKnownGameState = <S = unknown>(
	query: Required<UpdaterProps<LastKnownGameState, S>>['query'],
	priority: UIStatePriority = UIStatePriority.Snail
): S => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}
	const [state, setState] = useState<S>(
		query(self.memory.lastKnownGameState as LastKnownGameState)
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

export const onReactStateUpdate = (newState: LastKnownGameState) => {
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
