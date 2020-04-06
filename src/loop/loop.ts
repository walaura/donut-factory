import { Road } from '../dressing/road';
import { MsgActions } from '../helper/message';
import { Agent, GameState, ID, LedgerRecord } from '../helper/defs';
import { postFromWindow } from './../helper/message';
import { getHandlers } from './handlers';
import { semiFlatten } from '../helper/ledger';

let time = Date.now();
let agentMutations: AgentMutation[] = [];
let gameMutations: GameMutation[] = [];

interface AgentMutation<S extends Agent = Agent> {
	agentId: string;
	mutation: (prevState: S, gameState: GameState, context: any[]) => S;
	context: any[];
}

type GameMutation = (gameState: GameState) => GameState;

export const mutateAgent = <S extends Agent = Agent>(
	agentId: AgentMutation['agentId'],
	mutation: AgentMutation<S>['mutation'],
	context: any[] = []
) => {
	if (self.document) {
		postFromWindow({
			action: MsgActions.MUTATE_AGENT,
			agentId,
			context,
			mutation: mutation.toString(),
		});
	} else {
		agentMutations.push({ agentId, mutation, context });
	}
};

export const mutateGame = (mutation: GameMutation) => {
	gameMutations.push(mutation);
};

export const findAgent = (id: ID, gameState: GameState): Agent => {
	return gameState.agents[id];
};

export const pauseGame = () => {
	mutateGame((state) => ({
		...state,
		paused: true,
	}));
};

export const addAgent = (agent: Agent) => {
	mutateGame((state) => ({
		...state,
		agents: { ...state.agents, [agent.id]: agent },
	}));
};

export const addRoad = (road: Road) => {
	mutateGame((state) => ({
		...state,
		roads: { ...state.roads, [road.id]: road },
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
		gameState = gameMutations.pop()(gameState);
	}

	while (agentMutations.length) {
		const muta = agentMutations.pop();
		gameState.agents[muta.agentId] = muta.mutation(
			gameState.agents[muta.agentId],
			gameState,
			muta.context
		);
	}

	for (let unit of Object.values(gameState.agents)) {
		if (unit.handler) {
			unit = getHandlers()[unit.handler](delta, unit as any, gameState);
		}
	}

	//clean the ledger lol;
	if (gameState.ledger.length > 200) {
		gameState.ledger = semiFlatten(gameState.ledger);
	}

	return gameState;
};
