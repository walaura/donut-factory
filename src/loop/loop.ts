import { WithHandler, entityHasHandler, WithOrders } from './../helper/defs';
import { Road } from '../dressing/road';
import { MsgActions } from '../helper/message';
import { Entity, GameState, ID, LedgerRecord } from '../helper/defs';
import { postFromWindow } from './../helper/message';
import { getHandlers } from './handlers';
import { semiFlatten } from '../helper/ledger';

let time = Date.now();
let agentMutations: AgentMutation<any>[] = [];
let gameMutations: GameMutation[] = [];

interface AgentMutation<S extends Entity = Entity> {
	entityId: string;
	mutation: (prevState: S, gameState: GameState, context: any[]) => Partial<S>;
	context: any[];
}

interface GameMutation {
	mutation: (gameState: GameState, context: any[]) => GameState;
	context: any[];
}

export const mutateAgent = <S extends Entity = Entity>(
	entityId: AgentMutation['entityId'],
	mutation: AgentMutation<S>['mutation'],
	context: any[] = []
) => {
	if (self.document) {
		postFromWindow({
			action: MsgActions.MUTATE_AGENT,
			entityId,
			context,
			mutation: mutation.toString(),
		});
	} else {
		agentMutations.push({ entityId, mutation, context });
	}
};

export const mutateGame = (
	mutation: GameMutation['mutation'],
	context: any[] = []
) => {
	if (self.document) {
		postFromWindow({
			action: MsgActions.MUTATE_GAME,
			context,
			mutation: mutation.toString(),
		});
	} else {
		gameMutations.push({ mutation, context });
	}
};

export const findEntity = (id: ID, gameState: GameState): Entity | null => {
	if (gameState.entities[id]) {
		return gameState.entities[id];
	}
	return null;
};

export const pauseGame = () => {
	mutateGame((state) => ({
		...state,
		paused: true,
	}));
};

export const deleteEntity = (entityId: ID) => {
	mutateGame(
		(state, [entityId]: [ID]) => {
			delete state.entities[entityId];
			return state;
		},
		[entityId]
	);
};

export const addEntity = (agent: Entity) => {
	mutateGame(
		(state, [agent]: [Entity]) => ({
			...state,
			entities: { ...state.entities, [agent.id]: agent },
		}),
		[agent]
	);
};

export const linkOrder = (entityId: ID, orderId: ID) => {
	mutateAgent<Entity & WithOrders>(
		entityId,
		(prev, _, [orderId]) => ({
			...prev,
			orders: {
				...prev.orders,
				list: [...prev.orders.list, orderId],
			},
		}),
		[orderId]
	);
};
export const clearOrders = (entityId: ID) => {
	mutateAgent<Entity & WithOrders>(entityId, (prev, _) => ({
		...prev,
		orders: {
			...prev.orders,
			list: [],
		},
	}));
};

export const addFunds = (record: Omit<LedgerRecord, 'date'>) => {
	mutateGame((state) => ({
		...state,
		ledger: [...state.ledger, { ...record, date: state.date }],
	}));
};

export const gameLoop = (prevState: GameState) => {
	let gameState = { ...prevState };

	gameState.paused = false;
	const now = Date.now();
	const delta = (now - time) / 16;
	time = now;
	gameState.date += 1000;

	while (gameMutations.length) {
		const muta = gameMutations.pop();
		if (!muta) continue;
		gameState = muta.mutation(gameState, muta.context);
	}
	while (agentMutations.length) {
		const muta = agentMutations.pop();
		if (!muta) continue;
		gameState.entities[muta.entityId] = {
			...gameState.entities[muta.entityId],
			...muta.mutation(
				gameState.entities[muta.entityId],
				gameState,
				muta.context
			),
		};
	}

	for (let entity of Object.values(gameState.entities)) {
		if (entityHasHandler(entity)) {
			entity = getHandlers()[entity.handler](delta, entity as any, gameState);
		}
	}

	//clean the ledger lol;
	if (gameState.ledger.length > 200) {
		gameState.ledger = semiFlatten(gameState.ledger);
	}

	return gameState;
};
