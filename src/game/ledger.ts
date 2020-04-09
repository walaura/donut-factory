import { LedgerRecord } from '../helper/defs';
import { Reducer } from '../global/actions';
import { dispatch } from '../global/dispatch';

export type LedgerAction = {
	type: 'ledger-add-funds';
	record: Omit<LedgerRecord, 'date'>;
};

export const addFunds = (record: Omit<LedgerRecord, 'date'>) => {
	dispatch({
		type: 'ledger-add-funds',
		record,
	});
};

export const ledgerReducer: Reducer<LedgerAction> = (action, { gameState }) => {
	switch (action.type) {
		case 'ledger-add-funds': {
			return {
				...gameState,
				ledger: [
					...gameState.ledger,
					{ ...action.record, date: gameState.date },
				],
			};
		}
	}
};
