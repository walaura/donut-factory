type HandlerName = import('../global/handlers').HandlerName;
type Vehicle = import('../entity/vehicle').Vehicle;
type Product = import('../entity/product').Product;
type UnitAgent = import('../entity/factory').UnitAgent;
type Target = import('./target').Target;
type XY = import('./xy').XY;
type CanvasRendererState = import('../wk/canvas.defs').CanvasRendererState;
type Road = import('../entity/road').Road;
type OrderQueue = import('../entity/composables/with-orders').OrderQueue;
type Order = import('../entity/composables/with-orders').Order;

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
