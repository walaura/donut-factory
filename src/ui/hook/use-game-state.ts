import { useEffect, useState } from 'preact/hooks';
import sum from 'hash-sum';
import {
	GameState,
	LastKnownGameState,
	LastKnownCanvasRendererState,
	ID,
} from '../../helper/defs';
export enum UIStatePriority {
	Snail = 1250,
	Cat = 500,
	Bunny = 200,
	Sonic = 50,
	UI = -1,
}

let callbacks: Callback<unknown>[] = [];

type Callback<S> = {
	lastCalled: number;
	priority: UIStatePriority;
	callback: (s: S) => void;
	query: Query<S>;
	hash: ID;
};

const subscribeToStateUpdate = <S extends LastKnownGameState | any>(
	callback: (S) => void,
	{
		priority = UIStatePriority.Snail,
		query = (s: LastKnownGameState) => (s as unknown) as S,
	}: UpdaterProps<S> = {}
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

type Query<S> = (from: LastKnownGameState) => S;
type UpdaterProps<S> = {
	priority?: UIStatePriority;
	query?: Query<S>;
};

export const useLastKnownGameState = <S = unknown>(
	query: Required<UpdaterProps<S>>['query'],
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
