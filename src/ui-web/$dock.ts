import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';
import { $emoji } from './components/emoji';
import { $pretty } from './components/rows/pretty';
import { TemplateHole } from './helper/defs';
import { numberWithCommas } from './helper/format';
import { css } from './helper/style';
import { UIStatePriority, useGameState } from './helper/useGameState';
import { allAgents } from './inspectors/all-agents';
import { moneyInspector } from './inspectors/money-inspector';
import { generateWindowEv } from './$window';

const $pressable = (
	children: TemplateHole,
	{
		onClick,
	}: {
		onClick?: (MouseEvent) => void;
	}
) =>
	onClick
		? html`<button style=${styleMap({ display: 'contents' })} @click=${onClick}>
				${children}
		  </button>`
		: children;

const $dockEmoji = ({
	emoji,
	title,
	onClick,
}: {
	onClick?: (ev: MouseEvent) => void;
	emoji: TemplateHole;
	title: TemplateHole;
}) => {
	const styles = css`
		min-width: calc(var(--pressable) - (var(--space-h) * 2));
		box-sizing: content-box;
		overflow: hidden;
		x-host {
			display: grid;
			align-items: center;
			justify-content: center;
			height: 100%;
			margin: 0 -2em;
			padding: 0 2em;
		}
	`;
	return html`<xdp-emoji class=${styles} title=${title}>
		${$pressable(html`<x-host>${$emoji(emoji)}</x-host>`, { onClick })}
	</xdp-emoji>`;
};

const $dockText = (children: TemplateHole) =>
	html`<xdp-text
		class=${css`
			display: grid;
			align-items: center;
			justify-content: center;
		`}
		>${children}</xdp-text
	>`;

const $dockPanel = (
	children: TemplateHole,
	{ onClick = undefined }: { onClick?: (ev: MouseEvent) => void } = {}
) => {
	const styles = css`
		background: var(--bg-light);
		font-weight: var(--font-bold);
		display: grid;
		border-radius: 1000em;
		height: var(--pressable);
		grid-auto-flow: column;
		grid-template-rows: 1fr;
		align-items: stretch;
		box-shadow: var(--shadow-1);
		overflow: hidden;
		& > * {
			padding-left: var(--space-h);
			padding-right: var(--space-h);
		}
		& > * + * {
			border-left: 1px solid var(--bg);
		}
		& > *:first-child {
			padding-left: calc(var(--space-h) * 1.5);
		}
		& > *:last-child {
			padding-right: calc(var(--space-h) * 1.5);
		}
	`;
	return $pressable(
		html`<x-dock-panel class=${styles}>${children}</x-dock-panel>`,
		{
			onClick,
		}
	);
};

const $dock = () => {
	const styles = css`
		position: fixed;
		contain: content;
		padding: calc(var(--space-h) * 2);
		display: grid;
		top: 0;
		right: 0;
		grid-auto-flow: column;
		grid-gap: calc(var(--space-h) * 2);
		& button:active x-emoji {
			transform: scale(1.5);
		}
	`;

	return html` <x-dock class=${styles}>
		${[
			$dockPanel(
				[
					$dockEmoji({ emoji: '💰', title: 'Money' }),
					$dockText(
						useGameState(
							(state) =>
								numberWithCommas(
									state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b)
								),
							UIStatePriority.Bunny
						)
					),
				],
				{
					onClick: (ev) => {
						generateWindowEv(ev)(moneyInspector());
					},
				}
			),
			$dockPanel(
				useGameState((state) => {
					let date = new Date(state.date);
					const dtf = new Intl.DateTimeFormat('en', {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					});
					const clock = new Intl.DateTimeFormat('en', {
						hour: 'numeric',
						minute: 'numeric',
					});
					return [
						$dockEmoji({ emoji: '📆', title: 'Calendar' }),
						$dockText(dtf.format(date)),
						$dockText(
							html`<div
								class=${css`
									width: 7ch;
									overflow: hidden;
									text-align: center;
								`}
							>
								${clock.format(date)}
							</div>`
						),
					];
				}, UIStatePriority.UI)
			),
			$dockPanel([
				$dockEmoji({
					emoji: '🌈',
					title: 'Manage agents',
					onClick: (ev) => {
						generateWindowEv(ev)(allAgents());
					},
				}),
				$dockEmoji({
					emoji: '🤓',
					title: 'Show global state',
					onClick: (ev) => {
						generateWindowEv(ev)({
							emoji: '🤓',
							title: 'All state',
							list: [
								html`<button
									@click=${() => {
										localStorage.removeItem('autosave');
										window.location.reload();
									}}
								>
									New game+
								</button>`,
								useGameState((state) => $pretty(state)),
							],
						});
					},
				}),
			]),
		]}
	</x-dock>`;
};

export { $dock };
