import { h } from 'preact';
import { css } from '../../helper/style';

const baseStyles = css`
	display: grid;
	grid-gap: var(--space-min);
`;

const layouts = {
	dense: css`
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
	`,
	longcat: css`
		grid-auto-rows: 1fr;
	`,
	fluffy: css`
		grid-auto-columns: 1fr;
	`,
};

export const MiniGrid = ({
	children,
	layout = 'dense',
}: {
	children;
	layout?: keyof typeof layouts;
}) => <div class={[baseStyles, layout].join(' ')}>{children}</div>;
