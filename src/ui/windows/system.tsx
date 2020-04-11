import { h } from 'preact';
import { VisibleButton } from '../components/Button';
import { Flex } from '../components/List/FlexList';
import { RowList } from '../components/List/RowList';
import { Pre } from '../components/Pre';
import { Padding } from '../components/primitives/Padding';
import { Info } from '../components/row/Info';
import { Tabs } from '../components/Tabs';
import { Heading } from '../components/type';
import { Wash } from '../components/Wash';
import { clock, longDate } from '../helper/format';
import { useLastKnownGameState } from '../hook/use-game-state';

const gitlog = require('../../../.git.json');

const AllState = () => {
	const state = useLastKnownGameState((s) => s);
	return <Pre>{state}</Pre>;
};

export const SystemMenu = () => {
	return (
		<Tabs>
			{[
				{
					emoji: '👋',
					name: 'About',
					contents: (
						<Flex distribute={['scroll', 'squish']} dividers>
							<RowList>
								<Padding>
									<p>
										Hey hi! This is Donut Factory. An experiment from{' '}
										<a href="http://twitter.com/freezydorito">@freezydorito</a>{' '}
										in building an OpenTTD clone from scratch.
										<br />
										<br />
										Things are a bit broken at the moment but feel free to try
										to make things work out!
										<br />
										<br />
										You can check out the source code at{' '}
										<a href="https://github.com/walaura/donut-factory">
											github
										</a>{' '}
										too
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
					),
				},
				{
					emoji: '🖥',
					name: 'All state',
					contents: (
						<Padding>
							<AllState />
						</Padding>
					),
				},
			]}
		</Tabs>
	);
};
