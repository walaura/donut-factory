import { CallableWindowRoute } from '../$window/$window';
import { $wash } from '../components/$wash';
import { $flex } from '../components/$flex';
import { useGameState } from '../helper/useGameState';
import { $pretty } from '../components/rows/pretty';
import { $padding } from '../components/$padding';
import { html } from 'lit-html';
import { $tabset } from '../components/$tabset';
import { $rows } from '../components/rows/row';
import { $heading } from '../components/type';
import { $infoSmall } from '../components/rows/info';
import { longDate, clock } from '../helper/format';

const gitlog = require('../../../.git.json');

const $intro = html`Hey hi! This is Donut Factory. An experiment from
	<a href="http://twitter.com/freezydorito">@freezydorito</a> in building an
	OpenTTD clone from scratch. <br /><br />
	Things are a bit broken at the moment but feel free to try to make things work
	out!<br /><br />
	You can check out the source code at
	<a href="https://github.com/walaura/donut-factory">github</a> too`;

export const $infoWindow = (): CallableWindowRoute => ({
	emoji: 'ℹ️',
	path: ['info'],
	name: 'Info & Settings',
	render: () =>
		$tabset({
			tabs: [
				{
					name: 'Update history',
					emoji: '💁‍♀️',
					contents: $rows([
						$intro,
						$padding(
							$rows(
								Object.values(gitlog).map((o: any) =>
									$infoSmall({
										label: o.subject,
										info: [
											{
												body:
													longDate(parseInt(o.authordate, 10) * 1000) +
													' - ' +
													clock(parseInt(o.authordate, 10) * 1000),
											},
										],
									})
								)
							),
							{ type: 'antiPadding' }
						),
					]),
				},

				{
					name: 'game state',
					emoji: '⚙️',
					contents: useGameState((state) => [$pretty(state)]),
				},
			],
		}),
});

$flex(
	[
		useGameState((state) => [$pretty(state)]),
		$padding(html`<button
			@click=${() => {
				localStorage.removeItem('autosave');
				window.location.reload();
			}}
		>
			New game+
		</button>`),
	],
	{ distribute: ['scroll', 'squish'], dividers: true }
);
