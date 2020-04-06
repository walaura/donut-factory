import { html } from 'lit-html';
import { LedgerRecord } from '../../helper/defs';
import { UIStatePriority, useGameState } from '../helper/state';
import { clock, longDate, numberWithCommas } from './../helper/format';
import { $table, $tableRow } from './rows/table';
import { $window } from './window';

const currency = '$';

const $row = (rc: LedgerRecord) =>
	$tableRow({
		icon: rc.tx > 0 ? '🤑' : '🔥',
		heading: `${rc.tx > 0 ? '+ ' : '- '}${currency}${numberWithCommas(
			Math.abs(rc.tx)
		)}`,
		accesories: [rc.reason, `${longDate(rc.date)} ${clock(rc.date)}`],
	});

const $moneyWindow = () =>
	$window('💰', 'Money', [
		useGameState((state) => {
			return html`<h1 style="text-align: center">
				${currency}${numberWithCommas(
					state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b)
				)}
			</h1>`;
		}, UIStatePriority.Snail),
		$table(useGameState((state) => [...state.ledger].reverse().map($row))),
	]);

export { $moneyWindow };
