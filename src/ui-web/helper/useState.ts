import { directive, Part } from 'lit-html';

type Setter<S> = S;
type Callback<S> = (state: S, setState: (newState: Setter<S>) => void) => any;

const useState = <S>(initialState: S) =>
	directive((callback: Callback<S>) => (part: Part) => {
		let state = initialState;
		const setState = (state: Setter<S>) => {
			part.setValue(callback(state, setState));
			part.commit();
		};
		part.setValue(callback(state, setState));
		part.commit();
	});

export { useState };
