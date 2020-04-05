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

const { nouns } = require('./names/nouns.json');

const ucFirst = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const randomArrKey = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const makeRoadName = () => {
	return [nouns, roadSuffix].map(randomArrKey).map(ucFirst).join(' ');
};
