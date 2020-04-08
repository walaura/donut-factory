import { HandlerName } from '../loop/handlers';
import { MoverAgent } from '../agent/mover';
import { Road } from '../dressing/road';
import { XY } from './xy';
import { Product } from '../dressing/product';

export type ID = string;

export enum EntityType {
	'Unit' = 'UNIT',
	'Mover' = 'MOVER',
	'Product' = 'PRODUCT',
}

export interface WithID {
	id: ID;
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

interface BaseEntity extends WithID, WithName {
	type: EntityType;
}

export interface HandleableEntity extends BaseEntity {
	handler?: HandlerName;
}

export interface PlaceableEntity extends BaseEntity, WithEmoji, XY {
	placeable: true;
}

export interface UnitAgent
	extends PlaceableEntity,
		HandleableEntity,
		WithName,
		WithColor {
	exports: number;
	imports: number;
	type: EntityType.Unit;
}

export type Entity = UnitAgent | MoverAgent | Product;

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
