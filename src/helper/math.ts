export const clamp = ({ min = 0, max = 1 }, number = 0) =>
	Math.min(Math.max(number, min), max);

export const declamp = ({ max = 1, min = 0 }, val = 5) => {
	return (val - min) / (max - min);
};

export const lerp = (start, end, t) => {
	return start * (1 - t) + end * t;
};
