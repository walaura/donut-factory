import { CargoAction, cargoReducer } from '../entity/composables/with-cargo';
import { OrderAction, orderReducer } from '../entity/composables/with-orders';
import { EntityAction, entityReducer } from '../game/entities';
import { LedgerAction, ledgerReducer } from '../game/ledger';
import { DeepPartial, Entity, GameState, ID } from '../helper/defs';
import { listenFromWorker, MsgActions } from '../global/message';
import { expectWorkerMemory } from '../global/global';
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
	expectWorkerMemory();
	if (self.memory.id !== 'GAME-WK') {
		throw 'Only the worker thread can commit mutations';
	}

	let gameState = { ...prevState };

	while (self.memory.actionQueue.length) {
		let action = self.memory.actionQueue.pop();
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
	if (self.memory.id === 'GAME-WK') {
		listenFromWorker((message) => {
			if (self.memory.id === 'GAME-WK') {
				if (message.action === MsgActions.PushGameAction) {
					self.memory.actionQueue.push(message.value);
				}
			} else {
				throw 'Listening from wrong place';
			}
		});
	}
};
