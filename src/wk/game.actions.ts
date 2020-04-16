import { CargoAction, cargoReducer } from '../entity/composables/with-cargo';
import { OrderAction, orderReducer } from '../entity/composables/with-orders';
import { EntityAction, entityReducer } from '../game/entities';
import { LedgerAction, ledgerReducer } from '../game/ledger';
import { DeepPartial, Entity, GameState, ID } from '../helper/defs';
import { MsgActions, mkChannel } from '../global/message';
import { getMemory } from '../global/memory';
const deepmerge = require('deepmerge');

export type GameAction =
	| OrderAction
	| EntityAction
	| LedgerAction
	| CargoAction;

export type GameReducer<A extends GameAction> = (
	action: A,
	{
		gameState,
		onEntity,
	}: {
		gameState: GameState;
		onEntity: <E extends Entity = Entity>(
			id: ID,
			callback: (e: E) => DeepPartial<E>
		) => GameState;
	}
) => GameState | undefined;

const reducers: GameReducer<GameAction>[] = [
	orderReducer,
	ledgerReducer,
	cargoReducer,
	entityReducer,
];

export const commitActions = (prevState: GameState): GameState => {
	let mm = getMemory('GAME-WK');

	let gameState = { ...prevState };

	while (mm.memory.actionQueue.length) {
		let action = mm.memory.actionQueue.pop();
		if (!action) {
			return gameState;
		}
		for (let reducer of reducers) {
			let gameStateMaybe = reducer(action, {
				gameState,
				onEntity: (id, callback) => {
					gameState.entities[id] = deepmerge(
						gameState.entities[id],
						callback(gameState.entities[id] as any),
						{
							arrayMerge: (dest, source) => source,
						}
					);
					return gameState;
				},
			});
			if (gameStateMaybe) {
				gameState = gameStateMaybe;
			}
		}
	}

	return gameState;
};

export const listen = () => {
	let channel = mkChannel('GAME-WK', 'MAIN');

	channel.listen((message) => {
		let mm = getMemory('GAME-WK');
		if (message.action === MsgActions.PushGameAction) {
			mm.memory.actionQueue.push(message.value);
		}
	});
};
