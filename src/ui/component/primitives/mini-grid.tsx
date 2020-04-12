import { h } from 'preact';
import { css } from '../../helper/style';
import { WithLayoutHints } from '../../hook/use-layout-hint';

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
		grid-auto-flow: column;
	`,
};

export const MiniGrid = ({
	children,
	layout = 'dense',
}: {
	children;
	layout?: keyof typeof layouts;
}) => (
	<WithLayoutHints
		horizontal={
			layout === 'fluffy' || layout === 'dense' ? 'narrower' : 'normal'
		}
		vertical={layout === 'dense' ? 'narrower' : 'normal'}>
		<div class={[baseStyles, layouts[layout]].join(' ')}>{children}</div>
	</WithLayoutHints>
);
