import { h } from 'preact';
import { css } from '../../helper/style';

const styles = css`
	& > * {
		box-shadow: 0 1px 0 0 var(--divider);
	}
`;

export const RowList = ({
	children,
}: {
	children: preact.ComponentChildren[];
}) => (
	<div class={styles}>
		{(children ?? []).map((children) => (
			<div children={children} />
		))}
	</div>
);
