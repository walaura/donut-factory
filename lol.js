const lineReplace = require('line-replace');
lineReplace({
	file: './node_modules/postcss/lib/map-generator.js',
	line: 193,
	text: '',
	addNewLine: true,
	callback: () => {
		console.log('🚚🍩🚚🍩🚚🍩🚚🍩');
	},
});
