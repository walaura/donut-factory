const roadSuffix = [
	'street',
	'avenue',
	'gate',
	'approach',
	'friars',
	'park',
	'summit',
	'roadway',
	'way',
	'freeway',
];

const factorySuffix = [
	'& Daughters',
	'MFG',
	'Inc.',
	'widgets',
	'Incorporated',
	'Manufactures',
];

const { nouns } = require('./names/nouns.json');
const names = require('./names/first-names.json');

const ucFirst = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const randomArrKey = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const makeRoadName = () => {
	return [nouns, roadSuffix].map(randomArrKey).map(ucFirst).join(' ');
};

export const makeFactoryName = () => {
	return [names, names, factorySuffix].map(randomArrKey).map(ucFirst).join(' ');
};

export const makeConsumerName = () => {
	return [names, names].map(randomArrKey).map(ucFirst).join(' ');
};
