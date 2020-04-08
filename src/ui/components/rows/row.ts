import { html } from 'lit-html';

const $row = (children) => html`
	<xr-row class="x-window-breakout-padding">
		${children}
	</xr-row>
`;

const $rows = (children: any[], { breakout = true } = {}) =>
	html` <style>
			x-rows {
				display: grid !important;
				grid-auto-rows: minmax(1fr, min-content);
			}
			x-rows[data-breakout='true'] {
				margin: calc(var(--space-v) * -2) calc(var(--space-h) * -1);
			}
			x-rows > xr-row {
				border-bottom: 1px solid var(--bg-light);
				padding: calc(var(--space-v) * 2) var(--space-h);
			}
		</style>
		<x-rows data-breakout=${breakout}>
			${children.map($row)}
		</x-rows>`;

export { $rows };
