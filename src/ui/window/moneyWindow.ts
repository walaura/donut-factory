import { html } from 'lit-html';
import { LedgerRecord } from '../../helper/defs';
import { UIStatePriority, useGameState } from '../helper/useGameState';
import { clock, longDate, numberWithCommas } from './../helper/format';
import { $infoBig } from './rows/info';
import { $window } from './window';
import { $rows } from './rows/row';

const currency = '$';

const $row = (rc: LedgerRecord) =>
	$infoBig({
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
		useGameState((state) => $rows([...state.ledger].reverse().map($row))),
	]);

export { $moneyWindow };
