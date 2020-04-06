import { html } from 'lit-html';

const $tableRow = ({
	icon,
	onClick = null,
	centered = false,
	heading,
	accesories,
}) => html`
	<table-row
		class="x-window-breakout-padding"
		data-centered=${centered}
		@click=${onClick}
	>
		<tr-icon>${icon}</tr-icon>
		<tr-body>
			<h3>${heading}</h3>
			${accesories.map((a) => html`<p>${a}</p>`)}
		</tr-body>
	</table-row>
`;

const $table = (children: any) =>
	html`<x-table class="x-window-breakout">${children}</x-table>`;

export { $table, $tableRow };
