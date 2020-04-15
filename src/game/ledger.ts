import { LedgerRecord } from '../helper/defs';
import { dispatchToGame } from '../global/dispatch';
type GameReducer<X> = import('../wk/game.actions').GameReducer<X>;

export type LedgerAction = {
	type: 'ledger-add-funds';
	record: Omit<LedgerRecord, 'date'>;
};

export const addFunds = (record: Omit<LedgerRecord, 'date'>) => {
	dispatchToGame({
		type: 'ledger-add-funds',
		record,
	});
};

export const ledgerReducer: GameReducer<LedgerAction> = (
	action,
	{ gameState }
) => {
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
