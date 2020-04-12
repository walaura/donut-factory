import { h } from 'preact';
import { LedgerRecord } from '../../helper/defs';
import { Info } from '../component/row/info';
import { Flex } from '../component/list/flex-list';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Wash } from '../component/wash';
import { clock, longDate, numberWithCommas } from '../helper/format';
import { css } from '../helper/style';
import { UIStatePriority, useLastKnownGameState } from '../hook/use-game-state';

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
			<Flex distribute={['squish', 'scroll']}>
				{[
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
					</Padding>,
					<RowList>
						{[...ledger].reverse().map((entry) => (
							<Row>{entry}</Row>
						))}
					</RowList>,
				]}
			</Flex>
		</Wash>
	);
};
