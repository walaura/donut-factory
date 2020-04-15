import type { Vehicle } from '../entity/vehicle';
import type { HandlerName } from '../global/handlers';
import type { Target } from './target';
import type { XY } from './xy';
import type { OrderQueue, Order } from '../entity/composables/with-orders';
import type { Product } from '../entity/product';
import type { UnitAgent } from '../entity/factory';
import type { Road } from '../entity/road';
import type { CanvasRendererState } from '../wk/canvas.defs';

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

export type LastKnownGameState = Readonly<GameState>;
export type LastKnownCanvasState = Readonly<CanvasRendererState>;

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never;
