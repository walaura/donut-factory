import { html } from 'lit-html';
import { css } from '../helper/style';
import { TemplateHole } from '../helper/defs';

const base = css`
	display: grid;
	justify-content: stretch;
	align-items: stretch;
`;

const metrics = {
	padding: {
		small: css`
			padding: 4px;
		`,
		normal: css`
			padding: calc(var(--space-v) * 2) var(--space-h);
		`,
	},
	antiPadding: {
		small: css`
			margin: -4px;
		`,
		normal: css`
			margin: calc(var(--space-v) * -2) calc(var(--space-h) * -1);
		`,
	},
};
const $padding = (
	children: TemplateHole,
	{
		type = 'padding',
		size = 'normal',
	}: {
		type?: keyof typeof metrics;
		size?: keyof typeof metrics['padding'];
	} = {}
) => {
	const className = metrics[type][size];
	return html`<div class=${[className].join(' ')}>${children}</div>`;
};

export { $padding };
