import { HandlerName } from '../loop/handlers';
import { Vehicle } from '../agent/vehicle';
import { Road } from '../dressing/road';
import { XY } from './xy';
import { Product } from '../dressing/product';
import { UnitAgent } from '../agent/factory';
import { OrderQueue, Order } from '../agent/with-orders';
import { Target } from './pathfinding';

export type ID = string;

export enum EntityType {
	'Unit' = 'UNIT',
	'Vehicle' = 'VEHICLE',
	'Product' = 'PRODUCT',
	'Road' = 'ROAD',
	'Order' = 'Order',
}

export interface WithID {
	id: ID;
}

export interface WithOrders {
	orders: OrderQueue;
}

export interface WithCargo {
	cargo: {
		[key in Product['id']]: {
			quantity: number;
			productId: Product['id'];
		};
	};
}

export interface WithName {
	name: string;
}
export interface WithEmoji {
	emoji: string;
}
export interface WithColor {
	color: number;
}
export interface WithPath {
	path: Target[];
	pathHistory: Target[];
}

export interface BaseEntity extends WithID, WithEmoji, WithName {
	type: EntityType;
}

export interface WithHandler {
	handler?: HandlerName;
}
export const entityHasHandler = (
	entity: Entity
): entity is Entity & Required<WithHandler> => {
	return 'handler' in entity;
};

export interface WithXY extends BaseEntity, XY {}

export const entityHasXY = (
	entity: Entity
): entity is Entity & Required<WithXY> => {
	return 'x' in entity;
};

export type Entity = UnitAgent | Vehicle | Product | Road | Order;

export interface LedgerRecord {
	tx: number;
	reason: string;
	date: number;
	relevantAgents?: ID[];
}

export type Ledger = LedgerRecord[];

export interface GameState {
	paused: boolean;
	width: number;
	height: number;
	date: number;
	ledger: Ledger;
	entities: { [key: string]: Entity };
	roads: { [key: string]: Road };
}
