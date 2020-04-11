import { CallableWindowRoute } from '../$window/$window';
import { $wash } from '../components/$wash';
import { $flex } from '../components/$flex';
import { useGameState } from '../helper/useGameState';
import { $pretty } from '../components/rows/pretty';
import { $padding } from '../components/$padding';
import { html } from 'lit-html';
import { $tabset } from '../components/$tabset';
import { $rows } from '../components/rows/row';
import { $infoSmall } from '../components/rows/info';
import { longDate, clock } from '../helper/format';
import { h } from 'preact';
import { Flex } from '../components/List/FlexList';
import { Wash } from '../components/Wash';
import { Padding } from '../components/Padding';
import { VisibleButton } from '../components/Button';
import { RowList } from '../components/List/RowList';
import { Info } from '../components/Info/Info';
import { Heading } from '../components/type';

const gitlog = require('../../../.git.json');

export const SystemMenu = () => {
	return (
		<Wash>
			<Flex distribute={['scroll', 'squish']} dividers>
				<RowList>
					<Padding>
						<p>
							Hey hi! This is Donut Factory. An experiment from{' '}
							<a href="http://twitter.com/freezydorito">@freezydorito</a> in
							building an OpenTTD clone from scratch.
							<br />
							<br />
							Things are a bit broken at the moment but feel free to try to make
							things work out!
							<br />
							<br />
							You can check out the source code at{' '}
							<a href="https://github.com/walaura/donut-factory">github</a> too
						</p>
					</Padding>
					<Padding>
						<Heading>LOOK @ WHATS GOING ON</Heading>
					</Padding>
					{Object.values(gitlog).map((o: any) => (
						<Padding>
							<Info icon={'🎀'} heading={o.subject}>
								{[
									o.body &&
										o.body.split('\n').map((itm) => (
											<p>
												{itm}
												<br />
											</p>
										)),
									longDate(parseInt(o.authordate, 10) * 1000) +
										' - ' +
										clock(parseInt(o.authordate, 10) * 1000),
								]}
							</Info>
						</Padding>
					))}
				</RowList>
				<Padding>
					<VisibleButton
						onClick={() => {
							localStorage.removeItem('autosave');
							window.location.reload();
						}}>
						NEW GAME (useful if things r broken)
					</VisibleButton>
				</Padding>
			</Flex>
		</Wash>
	);
};
