import { factoryHandler } from './../agent/factory';
import { moverHandler } from './../agent/mover';
import { GameState, Entity } from '../helper/defs';

export type HandlerName = keyof ReturnType<typeof getHandlers>;

export type HandlerFn<T extends Entity = Entity> = (
	tick: number,
	ownState: T,
	gameState: GameState
) => T;

export const getHandlers = () => ({
	factoryHandler,
	moverHandler,
});
