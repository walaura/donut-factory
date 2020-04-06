import { HandlerName } from '../loop/handlers';
import { MoverAgent } from '../agent/mover';
import { Road } from '../dressing/road';
import { XY } from './xy';

export type ID = string;

export enum AgentStateType {
	'UNIT',
	'MOVER',
}

export interface WithXY extends XY {
	placeable: true;
}

export interface WithID {
	id: ID;
}

export interface WithName {
	name: string;
}

export interface BaseAgent extends WithID, WithName {
	emoji: string;
	type: AgentStateType;
	handler?: HandlerName;
}

export interface BasePlaceableAgent extends BaseAgent, WithXY {}

export interface UnitAgent extends BasePlaceableAgent, XY {
	exports: number;
	imports: number;
	type: AgentStateType.UNIT;
}

export type Agent = UnitAgent | MoverAgent;

export interface LedgerRecord {
	tx: number;
	reason: string;
	date: number;
}

export type Ledger = LedgerRecord[];

export interface GameState {
	paused: boolean;
	width: number;
	height: number;
	date: number;
	ledger: Ledger;
	agents: { [key: string]: Agent };
	roads: { [key: string]: Road };
}
