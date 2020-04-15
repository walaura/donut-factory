import { h } from 'preact';
import { css } from '../../helper/style';

const metrics = {
	padding: {
		small: css`
			padding: var(--space-min);
		`,
		normal: css`
			padding: var(--space-v) var(--space-h);
		`,
	},
	antiPadding: {
		small: css`
			margin: calc(var(--space-min) * -1);
		`,
		normal: css`
			margin: calc(var(--space-v) * -2) calc(var(--space-h) * -1);
		`,
	},
};

export type PaddingSize = keyof typeof metrics['padding'];

const Padding = ({
	children,
	type = 'padding',
	size = 'normal',
}: {
	children: preact.ComponentChildren;
	type?: keyof typeof metrics;
	size?: PaddingSize;
}) => {
	return (
		<div
			class={
				css`
					box-sizing: border-box;
					display: flex;
					height: inherit;
				` +
				' ' +
				metrics[type][size]
			}>
			{children}
		</div>
	);
};

export { Padding };
