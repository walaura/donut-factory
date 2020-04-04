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

let state: GameState = { date: 0, agents: [] };
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
		unit.loop(delta);
	}
	renderGame(state);
	requestAnimationFrame(loop);
};

loop();
