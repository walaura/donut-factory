import { h } from 'preact';
import { css } from '../helper/style';

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
const Padding = ({
	children,
	type = 'padding',
	size = 'normal',
}: {
	children: preact.ComponentChildren;
	type?: keyof typeof metrics;
	size?: keyof typeof metrics['padding'];
}) => {
	return <div class={metrics[type][size]}>{children}</div>;
};

export { Padding };
