import { directive, Part } from 'lit-html';
import { ScopeCell } from '../$window/$window';

type Setter<S> = S;
type Callback<S> = (state: S, setState: (newState: Setter<S>) => void) => any;

const stateMap = new WeakMap();

const useState = <S>(initialState: S) =>
	directive((callback: Callback<S>) => (part: Part) => {
		let myState = stateMap.get(part);
		if (myState === undefined) {
			stateMap.set(part, initialState);
			myState = stateMap.get(part);
		}
		let state = myState || initialState;
		const setState = (state: Setter<S>) => {
			stateMap.set(part, state);
			requestAnimationFrame(() => {
				part.setValue(callback(state, setState));
				part.commit();
			});
		};
		part.setValue(callback(initialState, setState));
	});

export { useState };
