import { h } from 'preact';
import { LedgerRecord } from '../../helper/defs';
import { Info } from '../component/row/info';
import { Flex } from '../component/list/flex-list';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Wash } from '../component/wash';
import { clock, longDate, numberWithCommas } from '../helper/format';
import { css } from '../helper/style';
import { useLastKnownGameState } from '../hook/use-game-state';
import { UIStatePriority } from '../hook/use-global-state';
import { Scroll } from '../component/primitives/scroll';

const currency = '$';

const Row = ({ children: rc }: { children: LedgerRecord }) => (
	<Padding>
		<Info
			icon={rc.tx > 0 ? '🤑' : '🔥'}
			heading={
				rc.tx > 0 ? '+ ' : '- ' + currency + numberWithCommas(Math.abs(rc.tx))
			}>
			{[rc.reason, `${longDate(rc.date)} ${clock(rc.date)}`]}
		</Info>
	</Padding>
);

export const MoneyInspector = () => {
	let ledger = useLastKnownGameState((s) => s.ledger, UIStatePriority.Snail);

	return (
		<Wash>
			<Flex dividers distribute={['squish', 'grow']}>
				<Padding>
					<h1
						class={css`
							text-align: center;
						`}>
						{currency +
							numberWithCommas(
								ledger.map(({ tx }) => tx).reduce((a, b) => a + b, 0)
							)}
					</h1>
				</Padding>
				<Scroll>
					<RowList>
						{[...ledger].reverse().map((entry) => (
							<Row>{entry}</Row>
						))}
					</RowList>
				</Scroll>
			</Flex>
		</Wash>
	);
};
