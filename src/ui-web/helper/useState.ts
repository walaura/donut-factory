import { directive, Part } from 'lit-html';

type Setter<S> = ((oldState: S) => S) | S;
type Callback<S> = (state: S, setState: (newState: Setter<S>) => void) => any;

const useState = <S>(initialState: S) =>
	directive((callback: Callback<S>) => (part: Part) => {
		let state = initialState;
		const setState = (s: Setter<S>) => {
			if (s instanceof Function) {
				state = s(state);
			} else {
				state = s;
			}
			part.setValue(callback(state, setState));
			part.commit();
		};
		part.setValue(callback(state, setState));
		part.commit();
	});

export { useState };
