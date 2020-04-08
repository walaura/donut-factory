import { html } from 'lit-html';
import { LedgerRecord } from '../../helper/defs';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { clock, longDate, numberWithCommas } from '../helper/format';
import { UIStatePriority, useGameState } from '../helper/useGameState';
import { ListWindowProps } from './../$window/$window';

const currency = '$';

const $row = (rc: LedgerRecord) =>
	$infoBig({
		icon: rc.tx > 0 ? '🤑' : '🔥',
		heading: `${rc.tx > 0 ? '+ ' : '- '}${currency}${numberWithCommas(
			Math.abs(rc.tx)
		)}`,
		accesories: [rc.reason, `${longDate(rc.date)} ${clock(rc.date)}`],
	});

const moneyInspector = (): ListWindowProps => ({
	emoji: '💰',
	title: 'Money',
	list: [
		useGameState((state) => {
			return html`<h1 style="text-align: center">
				${currency}${numberWithCommas(
					state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b)
				)}
			</h1>`;
		}, UIStatePriority.Snail),
		useGameState((state) => $rows([...state.ledger].reverse().map($row))),
	],
});

export { moneyInspector };
