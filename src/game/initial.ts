import { makeRoadName } from '../helper/names';
import { xy } from '../helper/xy';
import { GameState } from '../helper/defs';
import { MkProduct } from '../entity/product';
import { MkFactory } from '../entity/factory';
import { MkConsumer } from '../entity/consumer';
import { MkMover } from '../entity/vehicle';
import { MkRoad } from '../entity/road';
import { addEntity } from './entities';
import { addFunds } from './ledger';
import { clamp } from '../helper/math';
const perlin = require('perlin-noise');

export const startGame = () => {
	let products = [
		MkProduct('Mushroom', '🍄'),
		MkProduct('Strawberry', '🍓'),
		MkProduct('Waffle', '🥕'),
	];

	let factory = MkFactory(xy([10, 10]), [products[0].id, products[1].id]);
	let consumer = MkConsumer(xy([40, 15]));
	let mover = MkMover(products[0].id, factory.id, consumer.id);
	let firstRoad = MkRoad(makeRoadName(), { x: 10, y: 10 }, { x: 15, y: 28 });
	[
		...products,
		factory,
		consumer,
		mover,
		firstRoad,
		MkRoad(makeRoadName(), { x: 32, y: 15 }, { x: 15, y: 30 }),
		MkRoad(makeRoadName(), { x: 35, y: 5 }, { x: 60, y: 70 }),
	].map(addEntity);

	addFunds({
		tx: 10000,
		reason: `The owners of ${firstRoad.name} saw great potential in you`,
	});
};

export const getInitialState = () => {
	const size = 200;

	let noise = perlin.generatePerlinNoise(size, size, {
		octaveCount: 2,
		persistence: 0,
	});

	let height = perlin
		.generatePerlinNoise(size, size, {
			persistence: 0.8,
		})
		.map((value, index) => {
			if (value > 0.3) {
				return clamp({ min: 0, max: 1 }, value * 2);
			}
			return 0;
		});

	const initialState: GameState = {
		ledger: [],
		paused: false,
		width: 80,
		height: 40,
		date: 0,
		entities: {},
		map: {
			size,
			height,
			noise,
		},
	};
	return initialState;
};
