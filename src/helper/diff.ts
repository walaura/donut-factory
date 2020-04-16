import { GameState } from './defs';

/*lets be lazy for now lol */
export const diffState = (
	prev: Partial<GameState>,
	next: GameState
): Partial<GameState> => {
	const { map, ...returnable } = next;
	return returnable;
};
