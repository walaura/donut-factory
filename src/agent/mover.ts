import {
	Agent,
	AgentState,
	AgentType,
	MoverState,
	MoverStateType,
} from '../defs';

const move = (
	from: AgentState,
	to: AgentState,
	offset: [number, number] = [0, 0]
) => {
	let speed = 0.05;
	let tox = to.x + offset[0];
	let toy = to.y + offset[1];
	if (from.x > tox) {
		from.x -= Math.min(speed, from.x - tox);
	}
	if (from.x < tox) {
		from.x += Math.min(speed, tox - from.x);
	}
	if (from.y > toy) {
		from.y -= Math.min(speed, from.y - toy);
	}
	if (from.y < toy) {
		from.y += Math.min(speed, toy - from.y);
	}
};

const atPos = (
	from: AgentState,
	to: AgentState,
	offset: [number, number] = [0, 0]
) => {
	let tox = to.x + offset[0];
	let toy = to.y + offset[1];

	return from.x === tox && toy === from.y;
};

const Mover = (from = [], to = []): Agent => {
	let state: MoverState = {
		emoji: '🚚',
		x: 10,
		y: 0,
		held: 0,
		type: AgentType.MOVER,
		from,
		to,
		state: MoverStateType.Empty,
	};
	let loop = (tick) => {
		if (state.state === MoverStateType.Empty) {
			let moveTo = state.from[0];
			if (!atPos(state, moveTo.state, [3, 3])) {
				move(state, moveTo.state, [3, 3]);
			} else {
				state.held += 0.01;
				moveTo.state.exports -= 0.01;
			}
			if (state.held >= 1) {
				state.state = MoverStateType.Loaded;
			}
		} else {
			let moveTo = state.to[0];
			if (!atPos(state, moveTo.state)) {
				move(state, moveTo.state);
			} else {
				state.held -= 0.01;
				moveTo.state.imports += 0.01;
			}
			if (state.held <= 0) {
				state.state = MoverStateType.Empty;
			}
		}
	};
	return { state, loop };
};

export { Mover };
