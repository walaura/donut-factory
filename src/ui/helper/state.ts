import { GameState } from '../../helper/defs';
import { directive, TemplateResult, Part } from 'lit-html';

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

export const useGameState = directive(
	(callback: (state: GameState) => any, priority = UIStatePriority.Snail) => (
		part: Part
	) => {
		const cleanup = subscribeToStateUpdate((state) => {
			part.setValue(callback(state));
			part.commit();
			//@ts-ignore
			if (!part.endNode.isConnected) {
				cleanup();
			}
		}, priority);
	}
);

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
