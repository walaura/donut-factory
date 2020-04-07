import { MkConsumer } from '../agent/consumer';
import { MkFactory } from '../agent/factory';
import { MkMover } from '../agent/mover';
import { MkRoad } from '../dressing/road';
import { makeRoadName } from '../helper/names';
import { xy } from '../helper/xy';
import { GameState } from '../helper/defs';
import { addAgent, addRoad, addFunds } from './loop';

export const startGame = () => {
	let factory = MkFactory(xy([10, 10]));
	let consumer = MkConsumer(xy([40, 15]));
	let mover = MkMover([factory.id], [consumer.id]);

	let firstRoad = MkRoad(makeRoadName(), { x: 10, y: 10 }, { x: 15, y: 28 });
	[factory, consumer, mover].map(addAgent);
	[
		firstRoad,
		MkRoad(makeRoadName(), { x: 32, y: 15 }, { x: 15, y: 30 }),
		MkRoad(makeRoadName(), { x: 60, y: 20 }, { x: 55, y: 15 }),
	].map(addRoad);

	addFunds({
		tx: 10000,
		reason: `The owners of ${firstRoad.name} saw great potential in you`,
	});
};

export const getInitialState = () => {
	const initialState: GameState = {
		ledger: [],
		paused: false,
		width: 80,
		height: 40,
		date: 0,
		agents: {},
		roads: {},
	};
	return initialState;
};
