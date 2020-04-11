import { html } from 'lit-html';

export const $select = ({ values, selected, onChange }) => html`
	<select
		@change=${(ev) => {
			onChange(ev.target.value);
		}}
	>
	</select>
`;
