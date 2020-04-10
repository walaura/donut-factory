import { html } from 'lit-html';
import { css } from '../helper/style';

const baseStyles = css`
	transition: 0.1s ease-in-out;
	&:active {
		transform: scale(1.05);
	}
`;

export const $button = (children, { onClick }) =>
	html`<button class=${baseStyles} @click=${onClick}>${children}</button>`;
