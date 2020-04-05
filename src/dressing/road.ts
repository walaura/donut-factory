import { Road } from '../defs';

const fakeName = () => {};

const MkRoad = (
	name = 'wah',
	start = { x: 0, y: 0 },
	end = { x: 0, y: 0 }
): Road => {
	return {
		state: {
			name,
			start,
			end,
		},
	};
};

export { MkRoad };
