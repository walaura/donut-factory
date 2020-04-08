import { WithPath, Entity } from './../helper/defs';
export const popPath = (state: WithPath): WithPath => {
	let bit = state.path.shift();
	if (bit) {
		state.pathHistory = [bit, ...state.pathHistory.splice(0, 4)];
	}
	return state;
};
