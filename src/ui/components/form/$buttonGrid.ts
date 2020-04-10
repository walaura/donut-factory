import { html } from 'lit-html';
import { css } from '../../helper/style';
import { TemplateHole } from '../../helper/defs';

const styles = css`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	grid-gap: var(--space-h);
`;

export const $buttonGrid = (children: TemplateHole) => {
	return html`<x-grid class=${styles}>${children}</x-grid>`;
};
