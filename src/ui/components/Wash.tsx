import { css } from '../helper/style';
import { h } from 'preact';

const corners = {
	topLeft: 'borderTopLeftRadius',
	topRight: 'borderTopRightRadius',
	bottomLeft: 'borderBottomLeftRadius',
	bottomRight: 'borderBottomRightRadius',
};

type SquareOff = (keyof typeof corners)[];

const styles = (counter: boolean) => css`
	border-radius: var(--radius-small);
	background: ${counter ? 'var(--bg-counter-wash)' : 'var(--bg-wash)'};
	display: grid;
	min-height: 100%;
	width: 100%;
	justify-content: stretch;
	align-items: stretch;
	overflow: hidden;
	& & {
		--bg-wash: #fff;
		--bg-counter-wash: hsla(240, 50%, 96%, 0.9);
	}
`;

export const Wash = ({
	children,
	squareOff = [],
	counter = false,
}: {
	children: preact.ComponentChildren;
	squareOff?: SquareOff;
	counter?: boolean;
}) => {
	const inline = Object.fromEntries(
		squareOff.map((key) => [corners[key], '0'])
	);

	return (
		<div style={inline} class={styles(counter)}>
			{children}
		</div>
	);
};
