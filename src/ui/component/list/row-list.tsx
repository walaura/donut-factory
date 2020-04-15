import { h } from 'preact';
import { css } from '../../helper/style';
import { PaddingSize, Padding } from '../primitives/padding';

const styles = css`
	& > * {
		box-shadow: 0 1px 0 0 var(--divider);
	}
`;

const gridStyles = css`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 1px;
	& > * {
		box-shadow: 0 0 0 1px var(--divider);
	}
`;

export const RowList = ({
	children,
	padding = undefined,
	grid = false,
}: {
	children: preact.ComponentChildren;
	grid?: boolean;
	padding?: undefined | null | PaddingSize;
}) => {
	if (!(children instanceof Array)) {
		children = [children];
	}
	return (
		<div class={[styles, grid && gridStyles].join(' ')}>
			{'map' in children &&
				children.map((child) =>
					padding ? (
						<Padding size={padding}>
							<div>{child}</div>
						</Padding>
					) : (
						<div>{child}</div>
					)
				)}
		</div>
	);
};
