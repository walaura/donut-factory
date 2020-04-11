import { h } from 'preact';
import { css } from '../../helper/style';
import { PaddingSize, Padding } from '../primitives/Padding';

const styles = css`
	& > * {
		box-shadow: 0 1px 0 0 var(--divider);
	}
`;

export const RowList = ({
	children,
	padding = undefined,
}: {
	children: preact.ComponentChildren;
	padding?: undefined | null | PaddingSize;
}) => {
	if (!(children instanceof Array)) {
		children = [children];
	}
	return (
		<div class={styles}>
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
