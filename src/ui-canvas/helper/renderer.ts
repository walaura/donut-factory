import { GameState } from '../../helper/defs';

export type Renderer<S = undefined> = {
	onFrame: (
		prevState: GameState,
		state: GameState
	) => S extends undefined
		? { canvas: OffscreenCanvas }
		: { canvas: OffscreenCanvas; state: S };
};

export type OffScreenCanvasProps = {
	width: number;
	height: number;
	zoom: number;
};
