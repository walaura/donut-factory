import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';
import { dispatchToCanvas } from '../global/dispatch';
import { generateCallableWindowFromEv } from './$window/$window';
import { TemplateHole } from './helper/defs';
import { numberWithCommas } from './helper/format';
import { css } from './helper/style';
import { allEntities } from './inspectors/all-entities';
import { moneyInspector } from './inspectors/money-inspector';
import { $infoWindow } from './windows/system';
import { $emoji } from './components/$emoji';

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
			border-left: 1px solid var(--bg-wash);
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
		transition: 0.1s ease-in-out;
		& button:active [data-cssid='emoji'] {
			transform: scale(1.5);
		}
	`;

	return html` <x-dock class=${styles}>
		${[
			$dockPanel([$dockEmoji({ emoji: '💰', title: 'Money' })], {
				onClick: (ev) => {
					generateCallableWindowFromEv(ev)(moneyInspector());
				},
			}),
			html`<div
				class=${css`
					position: relative;
				`}
			></div>`,
			$dockPanel([
				$dockEmoji({
					emoji: '🌈',
					title: 'Manage agents',
					onClick: (ev) => {
						generateCallableWindowFromEv(ev)(allEntities());
					},
				}),
				$dockEmoji({
					emoji: '✏️',
					title: 'Edit mode',
					onClick: (ev) => {
						dispatchToCanvas({
							type: 'toggle-edit-mode',
						});
					},
				}),

				$dockEmoji({
					emoji: '⚙️',
					title: 'Show global state',
					onClick: (ev) => {
						generateCallableWindowFromEv(ev)($infoWindow());
					},
				}),
			]),
		]}
	</x-dock>`;
};

export { $dock };
