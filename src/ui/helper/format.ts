export const shortNumber = (number: number): string => {
	const round = Math.round(number * 10) / 10;
	if (number % 1 === 0) {
		return number + '';
	}
	return round.toFixed(1);
};

export function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
