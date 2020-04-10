import { html } from 'lit-html';
import { css } from '../helper/style';
import { TemplateHole } from '../helper/defs';

const base = css`
	width: 100%;
	height: 100%;
	overflow: scroll;
`;

const $scroll = (children: TemplateHole) => {
	return html`<div class=${[base]}>${children}</div>`;
};

export { $scroll };
