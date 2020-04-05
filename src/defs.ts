export enum AgentType {
	'UNIT',
	'MOVER',
}

export interface WithXY {
	x: number;
	y: number;
}

export interface BaseState extends WithXY {
	emoji: string;
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
	path: WithXY[];
};

export type AgentState = UnitState | MoverState;

export interface Agent<S extends AgentState = AgentState> {
	loop: (tick, GameState) => void;
	state: S;
}

export interface Road {
	state: {
		name?: string;
		start: WithXY;
		end: WithXY;
	};
}

export interface GameState {
	width: number;
	height: number;
	date: number;
	agents: Agent[];
	roads: Road[];
}
