import {
	Entity,
	GameState,
	ID,
	LedgerRecord,
	DeepPartial,
} from '../helper/defs';
import {
	listenFromWorker,
	MsgActions,
	postFromWindow,
} from '../helper/message';

import { expectWorkerMemory } from './global';
import { OrderAction, orderReducer } from '../entity/composables/with-orders';
import { CargoAction, cargoReducer } from '../entity/composables/with-cargo';
import { EntityAction, entityReducer } from '../game/entity';
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

export const mergeEntity = <S extends Entity = Entity>(
	entityId: ID,
	mergeable: DeepPartial<S>
) => {
	dispatch({
		type: 'merge-entity',
		entityId,
		mergeable,
	});
};

const deleteEntity = (entityId: ID) => {
	dispatch({
		type: 'delete-entity',
		entityId,
	});
};

export const addEntity = (entity: Entity) => {
	dispatch({
		type: 'add-entity',
		entity,
	});
};

const linkOrder = (entityId: ID, orderId: ID) => {
	dispatch({
		type: 'link-order',
		entityId,
		orderId,
	});
};

const clearOrders = (entityId: ID) => {
	dispatch({
		type: 'merge-entity',
		entityId,
		mergeable: {
			orders: {
				list: [],
			},
		},
	});
};

export type LedgerAction = {
	type: 'ledger-add-funds';
	record: Omit<LedgerRecord, 'date'>;
};

const addFunds = (record: Omit<LedgerRecord, 'date'>) => {
	dispatch({
		type: 'ledger-add-funds',
		record,
	});
};

const ledgerReducer: Reducer<LedgerAction> = (action, { gameState }) => {
	switch (action.type) {
		case 'ledger-add-funds': {
			return {
				...gameState,
				ledger: [
					...gameState.ledger,
					{ ...action.record, date: gameState.date },
				],
			};
		}
	}
};

const reducers = [orderReducer, entityReducer, ledgerReducer, cargoReducer];

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

listenFromWorker((message) => {
	if (self.memory.id === 'GAME-WK') {
		if (message.action === MsgActions.COMMIT_ACTION) {
			self.memory.actionQueue.push(message.value);
		}
	} else {
		throw 'Listening from wrong place';
	}
});

export { addFunds, clearOrders, linkOrder, deleteEntity };
