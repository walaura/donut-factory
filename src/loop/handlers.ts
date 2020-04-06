import { factoryHandler } from './../agent/factory';
import { moverHandler } from './../agent/mover';
import { GameState, Agent } from '../helper/defs';

export type HandlerName = keyof ReturnType<typeof getHandlers>;

export type HandlerFn<T extends Agent = Agent> = (
	tick: number,
	ownState: T,
	gameState: GameState
) => T;

export const getHandlers = () => ({
	factoryHandler,
	moverHandler,
});
