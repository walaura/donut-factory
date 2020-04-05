export enum AgentType {
	'UNIT',
	'MOVER',
}

export interface BaseState {
	emoji: string;
	x: number;
	y: number;
	type: AgentType;
}

export type UnitState = BaseState & {
	exports: number;
	imports: number;
	type: AgentType.UNIT;
};
export enum MoverStateType {
	'Loaded',
	'Empty',
}
export type MoverState = BaseState & {
	held: number;
	from: Agent<UnitState>[];
	to: Agent<UnitState>[];
	type: AgentType.MOVER;
	state: MoverStateType;
};

export type AgentState = UnitState | MoverState;

export interface Agent<S extends AgentState = AgentState> {
	loop: (tick, GameState) => void;
	state: S;
}

export interface Road {
	state: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	};
}

export interface GameState {
	width: number;
	height: number;
	date: number;
	agents: Agent[];
	roads: Road[];
}
