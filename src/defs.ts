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
	loop: (tick) => void;
	state: S;
}

export interface GameState {
	date: number;
	agents: Agent[];
}
