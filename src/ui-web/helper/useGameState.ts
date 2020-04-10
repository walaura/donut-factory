import { render } from 'lit-html';
import { GameState } from '../../helper/defs';
import { css } from './style';
import { request } from 'http';

export enum UIStatePriority {
	Snail = 1250,
	Cat = 500,
	Bunny = 200,
	Sonic = 50,
	UI = -1,
}

let callbacks: Callback[] = [];

type CallbackFn = (state: GameState) => void;
type Callback = {
	lastCalled: number;
	priority: UIStatePriority;
	callback: CallbackFn;
};

let lastKnownState;
const subscribeToStateUpdate = (
	callback: CallbackFn,
	priority = UIStatePriority.Snail
) => {
	let cbEntry = {
		lastCalled: -1,
		priority,
		callback,
	};
	callbacks.push(cbEntry);
	return () => {
		callbacks = callbacks.filter((entry) => entry !== cbEntry);
	};
};

export const useGameState = (
	callback: (state: GameState) => any,
	priority = UIStatePriority.Snail
) => {
	let $ref = document.createElement('div');
	$ref.className = css`
		display: contents;
	`;
	const cleanup = subscribeToStateUpdate((state) => {
		if (!$ref.isConnected) {
			//debugger;
			//cleanup();
		} else {
			render(callback(state), $ref);
		}
	}, priority);
	return $ref;
};

export const onStateUpdate = (newState) => {
	lastKnownState = newState;
	const now = Date.now();
	for (let cb of callbacks) {
		if (now - cb.lastCalled > cb.priority) {
			cb.callback(newState);
			cb.lastCalled = now;
		}
	}
};
