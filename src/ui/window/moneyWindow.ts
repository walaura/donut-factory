import { numberWithCommas, longDate, clock } from './../helper/format';
import { LedgerRecord } from '../../helper/defs';
import { $window } from './window';
import { GameState } from '../../helper/defs';
import { $pretty } from './rows/pretty';
import { html, directive } from 'lit-html';
import { useGameState, UIStatePriority } from '../helper/state';

const currency = '$';

const $row = (rc: LedgerRecord) => html`
	<table-row>
		<tr-icon>${rc.tx > 0 ? '🤑' : '🔥'}</tr-icon>
		${console.log('money')}
		<div>
			<strong
				>${rc.tx > 0 ? '+ ' : '- '}${currency}${numberWithCommas(
					Math.abs(rc.tx)
				)}</strong
			>
			<span>${rc.reason}</span>
			<span>${longDate(rc.date)} ${clock(rc.date)}</span>
		</div>
	</table-row>
`;

const $table = (state: LedgerRecord[]) => [...state].reverse().map($row);

const $moneyWindow = () =>
	$window('💰', 'Money', [
		useGameState((state) => {
			return html`<h1 style="text-align: center">
				${currency}${numberWithCommas(
					state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b)
				)}
			</h1>`;
		}, UIStatePriority.Snail),
		html`<x-table>${useGameState((state) => $table(state.ledger))}</x-table>`,
	]);

export { $moneyWindow };
