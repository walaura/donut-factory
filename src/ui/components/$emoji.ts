import { html } from 'lit-html';
import { css } from '../helper/style';

export const $emoji = (str) => {
	const styles = css`
		display: grid;
		width: 1em;
		height: 1em;
		align-items: center;
		justify-content: center;
		line-height: 1em;
		vertical-align: 1em;
		transform: scale(1.33);

		& > * {
			font-size: 1em;
			display: inline;
			line-height: 1em;
			vertical-align: 1em;
			transform: translate(10%, 5%);
		}
	`;
	return html`<[data-cssid='emoji'] class=${styles}><xe-glyph>${str}</xe-glyph></[data-cssid='emoji']>`;
};
