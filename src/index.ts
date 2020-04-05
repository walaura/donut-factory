import { Mover } from './agent/mover';
import {
	Agent,
	AgentState,
	AgentType,
	BaseState,
	GameState,
	UnitState,
} from './defs';
import renderGame from './render';

const Factory = (): Agent => {
	const state: UnitState = {
		exports: 0,
		imports: 0,
		type: AgentType.UNIT,
		emoji: '🏭',
		x: 4,
		y: 4,
	};
	let loop = (tick) => {
		state.exports += 0.025;
	};
	return { state, loop };
};

const Consumer = (): Agent => {
	const state: UnitState = {
		exports: 0,
		imports: 0,
		type: AgentType.UNIT,
		emoji: '🧚‍♀️',
		x: 30,
		y: 15,
	};

	let loop = (tick) => {};
	return { state, loop };
};

let state: GameState = {
	width: 80,
	height: 40,
	date: 0,
	agents: [],
	roads: [
		{
			name: 'first',
			state: {
				x1: 4,
				y1: 4,
				x2: 15,
				y2: 30,
			},
		},
		{
			name: 'second',
			state: {
				x1: 15,
				y1: 30,
				x2: 30,
				y2: 15,
			},
		},
	],
};
let factory = Factory();
let consumer = Consumer();
let mover = Mover([factory], [consumer]);

state.agents.push(factory, consumer, mover);
let time = Date.now();
const loop = () => {
	const now = Date.now();
	const delta = (now - time) / 16;
	time = now;

	state.date += 1000;
	for (let unit of state.agents) {
		unit.loop(delta, state);
	}
	renderGame(state);
	requestAnimationFrame(loop);
};

loop();
