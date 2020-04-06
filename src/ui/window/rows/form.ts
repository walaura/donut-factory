import { html } from 'lit-html';

const $formRow = ({ label, control = null }) => html`
	<xf-row class="x-window-breakout-padding">
		<h3>${label}</h3>
		${control}
	</xf-row>
`;

const $form = (children: any) =>
	html`<x-form class="x-window-breakout">${children}</x-form>`;

export { $form, $formRow };
