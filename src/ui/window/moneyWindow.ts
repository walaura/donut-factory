import { numberWithCommas, longDate, clock } from './../helper/format';
import { LedgerRecord } from './../../defs';
import { $window } from './window';
import { GameState } from '../../defs';
import { $pretty } from './rows/pretty';
import { html } from 'lit-html';

const $row = (rc: LedgerRecord) => html`
	<table-row>
		<tr-icon>🤑</tr-icon>
		<div>
			<strong>+${numberWithCommas(rc.tx)}</strong>
			<span>${rc.reason}</span>
			<span>${longDate(rc.date)} ${clock(rc.date)}</span>
		</div>
	</table-row>
`;

const $moneyWindow = $window('💰', 'Money', (state: GameState) =>
	[...state.ledger].reverse().map($row)
);

export { $moneyWindow };
