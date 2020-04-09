import { html } from 'lit-html';
import { TemplateHole } from '../../helper/defs';
import { css } from '../../helper/style';

const $row = (children) => html`
	<xr-row class="x-window-breakout-padding">
		${children}
	</xr-row>
`;

export const $insetRows = (children) => {
	const styles = css`
		background: var(--bg-light);
		overflow: scroll;
		display: block;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: var(--radius-small);
		margin: calc(2px + (var(--space-v) * -2)) calc(2px + (var(--space-h) * -1));
		& * {
			--bg-light: rgb(255, 231, 238);
		}
	`;
	return html` <x-inset class=${styles}>
		${$rows(children, { breakout: false })}
	</x-inset>`;
};

const $rows = (children: any[], { breakout = true } = {}) => {
	const styles = css`
		display: grid !important;
		grid-auto-rows: minmax(1fr, min-content);

		x-rows[data-breakout='true'] {
			margin: calc(var(--space-v) * -2) calc(var(--space-h) * -1);
		}
		x-rows > xr-row {
			border-bottom: 1px solid var(--bg-light);
			padding: calc(var(--space-v) * 2) var(--space-h);
		}
	`;
	return html` <x-rows class=${styles} data-breakout=${breakout}>
		${children.map($row)}
	</x-rows>`;
};

export { $rows };
