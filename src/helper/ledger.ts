import { LedgerRecord, Ledger } from './defs';

const total = (ledger: Ledger) =>
	ledger.map(({ tx }) => tx).reduce((a, b) => a + b, 0);

const flatten = (records: LedgerRecord[]): LedgerRecord => {
	const tx = total(records);
	const date = records[0].date;
	const reason = `Congrats on an amazing Quarter!`;
	return { tx, date, reason };
};

const semiFlatten = (ledger: Ledger): Ledger => {
	if (ledger.length > 100) {
		return [...ledger.splice(0, 10), flatten(ledger.splice(10))];
	}
	return ledger;
};

export { total, flatten, semiFlatten };
