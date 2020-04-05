import { Mover } from './agent/mover';
import { Agent, AgentType, GameState, UnitState } from './defs';
import { MkRoad } from './dressing/road';
import { Message, listen, MsgActions } from './helper/message';

declare var self: ServiceWorkerGlobalScope;

const Factory = (): Agent => {
	const state: UnitState = {
		exports: 0,
		imports: 0,
		type: AgentType.UNIT,
		emoji: '🏭',
		x: 10,
		y: 10,
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
		MkRoad('first road', { x: 10, y: 10 }, { x: 15, y: 30 }),
		MkRoad('second approach', { x: 30, y: 15 }, { x: 15, y: 30 }),
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

	return state;
};

listen(({ action }) => {
	let state = loop();
	if (action !== MsgActions.TICK) {
		return;
	}
	self.clients.matchAll().then((all) =>
		all.map((client) =>
			client.postMessage({
				action: 'TOCK',
				state: JSON.parse(JSON.stringify(state)),
			} as Message)
		)
	);
});
