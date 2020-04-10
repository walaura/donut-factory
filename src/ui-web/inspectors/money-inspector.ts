import { html } from 'lit-html';
import { CallableWindowRoute } from '../$window/$window';
import { LedgerRecord } from '../../helper/defs';
import { $flex } from '../components/$flex';
import { $padding } from '../components/$padding';
import { $wash } from '../components/$wash';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { clock, longDate, numberWithCommas } from '../helper/format';
import { UIStatePriority, useGameState } from '../helper/useGameState';

const currency = '$';

const $row = (rc: LedgerRecord) =>
	$infoBig({
		icon: rc.tx > 0 ? '🤑' : '🔥',
		heading: `${rc.tx > 0 ? '+ ' : '- '}${currency}${numberWithCommas(
			Math.abs(rc.tx)
		)}`,
		accesories: [rc.reason, `${longDate(rc.date)} ${clock(rc.date)}`],
	});

const moneyInspector = (): CallableWindowRoute => ({
	emoji: '💰',
	path: ['ledger'],
	name: 'Money',
	render: () =>
		$wash(
			$flex(
				[
					useGameState((state) => {
						return $padding(html`<h1 style="text-align: center">
							${currency}${numberWithCommas(
								state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b, 0)
							)}
						</h1>`);
					}, UIStatePriority.Snail),
					useGameState((state) => $rows([...state.ledger].reverse().map($row))),
				],
				{ distribute: ['squish', 'scroll'] }
			)
		),
});

export { moneyInspector };
