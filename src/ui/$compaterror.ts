import { html } from 'lit-html';
import { css } from './helper/style';

export const $compatError = () => {
	const styles = css`
		font-weight: bold;
		opacity: 0.66;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 20em;
		text-align: center;
	`;
	return !('OffscreenCanvas' in self)
		? html`<div class=${styles}>
				hey soz :( your browser wont let you see the game board (try
				firefox/chrome) but you can still play from the ui???
		  </div>`
		: null;
};
