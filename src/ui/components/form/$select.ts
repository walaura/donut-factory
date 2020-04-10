import { html } from 'lit-html';

export const $select = ({ values, selected, onChange }) => html`
	<select
		@change=${(ev) => {
			onChange(ev.target.value);
		}}
	>
		${Object.entries(values).map(
			([key, val]) =>
				html`<option
					value=${key}
					?selected=${key.toString() === selected.toString()}
				>
					${val}
				</option>`
		)}
	</select>
`;
