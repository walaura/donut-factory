import { ID } from '../../helper/defs';

export enum UIStatePriority {
	Snail = 1250,
	Cat = 500,
	Bunny = 200,
	Sonic = 50,
	UI = -1,
}

export type Callback<From, To> = {
	lastCalled: number;
	priority: UIStatePriority;
	callback: (s: To) => void;
	query: Query<From, To>;
	hash: ID;
};

type Query<From, To> = (from: From) => To;

export type UpdaterProps<From, To> = {
	priority?: UIStatePriority;
	query?: Query<From, To>;
};
