import { CargoAction, cargoReducer } from '../entity/composables/with-cargo';
import { OrderAction, orderReducer } from '../entity/composables/with-orders';
import { EntityAction, entityReducer } from '../game/entities';
import { LedgerAction, ledgerReducer } from '../game/ledger';
import { DeepPartial, Entity, GameState, ID } from '../helper/defs';
import {
	listenFromWorker,
	MsgActions,
	postFromWindow,
} from '../helper/message';
import { expectWorkerMemory } from './global';

const deepmerge = require('deepmerge');

export type Action = OrderAction | EntityAction | LedgerAction | CargoAction;

export type Reducer<A extends Action> = (
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

export const dispatch = (action: Action) => {
	if (self.memory.id === 'MAIN') {
		postFromWindow({
			action: MsgActions.COMMIT_ACTION,
			value: action,
		});
		return;
	}
	if (self.memory.id === 'GAME-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit yet :(';
};

const reducers = [orderReducer, ledgerReducer, cargoReducer, entityReducer];

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
		console.log(reducers);
		for (let reducer of reducers) {
			//@ts-ignore
			let gameStateMaybe = reducer(action, {
				gameState,
				//@ts-ignore
				onEntity: (id, callback) => {
					gameState.entities[id] = deepmerge(
						gameState.entities[id],
						callback(gameState.entities[id] as any),
						{
							arrayMerge: (dest, source) => source,
						}
					);
				},
			});
			if (gameStateMaybe) {
				gameState = gameStateMaybe;
			}
		}
	}

	return gameState;
};

if (self.memory.id === 'GAME-WK') {
	listenFromWorker((message) => {
		if (self.memory.id === 'GAME-WK') {
			if (message.action === MsgActions.COMMIT_ACTION) {
				self.memory.actionQueue.push(message.value);
			}
		} else {
			throw 'Listening from wrong place';
		}
	});
}
