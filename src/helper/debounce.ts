export const debounce = <F extends (...args: any) => any>(fn: F, t = 1000) => {
	let lastCall = 0;
	return (...args): F => {
		let now = Date.now();
		if (now > lastCall + t) {
			fn(...args);
			lastCall = now;
		}
	};
};

export const debounceLog = debounce(console.log);
