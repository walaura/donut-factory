import { GameState, ID, Agent } from './../defs';
import { MkConsumer } from '../agent/consumer';
import { MkFactory } from '../agent/factory';
import { MkMover } from '../agent/mover';
import { MkRoad, Road } from '../dressing/road';
import { handlers } from './handlers';

let time = Date.now();
let agentMutations: AgentMutation[] = [];
let gameMutations: GameMutation[] = [];

interface AgentMutation<S extends Agent = Agent> {
	agentId: string;
	mutation: (prevState: S, gameState: GameState) => S;
}

type GameMutation = (gameState: GameState) => GameState;

export const mutateAgent = <S extends Agent = Agent>(
	agentId: AgentMutation['agentId'],
	mutation: AgentMutation<S>['mutation']
) => {
	agentMutations.push({ agentId, mutation });
};

const mutateGame = (mutation: GameMutation) => {
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

const initialState: GameState = {
	paused: false,
	width: 80,
	height: 40,
	date: 0,
	agents: {},
	roads: {},
};
let factory = MkFactory();
let consumer = MkConsumer();
let mover = MkMover([factory.id], [consumer.id]);

[factory, consumer, mover].map(addAgent);
[
	MkRoad('first road', { x: 10, y: 10 }, { x: 15, y: 30 }),
	MkRoad('second approach', { x: 30, y: 15 }, { x: 15, y: 30 }),
	MkRoad('weir', { x: 60, y: 20 }, { x: 55, y: 15 }),
].map(addRoad);

export const gameLoop = (prevState: GameState) => {
	let gameState = { ...prevState };
	gameState.paused = false;
	const now = Date.now();
	const delta = (now - time) / 16;
	time = now;
	gameState.date += 1000;

	while (agentMutations.length) {
		const muta = agentMutations.pop();
		gameState.agents[muta.agentId] = muta.mutation(
			gameState.agents[muta.agentId],
			gameState
		);
	}

	while (gameMutations.length) {
		gameState = gameMutations.pop()(gameState);
	}

	for (let unit of Object.values(gameState.agents)) {
		if (unit.handler) {
			unit = handlers[unit.handler](delta, unit as any, gameState);
		}
	}
	return gameState;
};

export { initialState };
