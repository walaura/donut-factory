import { numberWithCommas } from './format';
const roundTo = (number, len = 10) => {
	return Math.round(number * len) / len;
};

export const shortNumber = (number: number): string => {
	const noFixed = roundTo(number, 1000);

	if (noFixed % 1 === 0) {
		return noFixed + '';
	}
	const round = roundTo(number, 10);
	return round.toFixed(1);
};

export function numberAsCurrency(x) {
	return '$ ' + numberWithCommas(x);
}

export function numberWithCommas(x) {
	return roundTo(x, 2)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const clock = (dt) => {
	let date = new Date(dt);
	const dtf = new Intl.DateTimeFormat('en', {
		hour: 'numeric',
		minute: 'numeric',
	});
	return dtf.format(date);
};

export const longDate = (dt) => {
	let date = new Date(dt);
	const dtf = new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
	return dtf.format(date);
};
