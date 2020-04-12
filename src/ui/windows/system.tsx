import { h } from 'preact';
import { VisibleButton } from '../component/button';
import { Flex } from '../component/list/flex-list';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Pre } from '../component/primitives/pre';
import { Info } from '../component/row/info';
import { Tabs } from '../component/tabs';
import { Heading } from '../component/type';
import { clock, longDate } from '../helper/format';
import { useLastKnownGameState } from '../hook/use-game-state';
import { Scroll } from '../component/primitives/scroll';

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
						<Flex distribute={['grow', 'squish']} dividers>
							<Scroll>
								<RowList>
									<Padding>
										<p>
											Hey hi! This is Donut Factory. An experiment from{' '}
											<a href="http://twitter.com/freezydorito">
												@freezydorito
											</a>{' '}
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
							</Scroll>
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
