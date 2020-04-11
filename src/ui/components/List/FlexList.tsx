import { h } from 'preact';
import { css } from '../../helper/style';
import { Padding, PaddingSize } from '../primitives/Padding';

const base = css`
	display: flex;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	contain: strict;
	& > * {
		overflow: hidden;
		position: relative;
		contain: layout;
	}
	& > * > * {
		height: 100%;
	}
`;

const distro = {
	grow: css`
		overflow: hidden;
		flex: 1 0 0;
	`,
	scroll: css`
		overflow: scroll;
		flex: 1 0 0;
	`,
	squish: css`
		flex: 0 1 auto;
	`,
};

const dividerStyles = css`
	box-shadow: 0 1px 0 0 var(--divider);
`;

const FlexList = ({
	children,
	distribute = ['grow'],
	direction = 'column',
	dividers = true,
	padding = undefined,
}: {
	children: preact.ComponentChildren[];
	padding?: undefined | null | PaddingSize;

	distribute?: (keyof typeof distro)[];
	direction?: 'row' | 'column';
	dividers?: boolean;
}) => {
	const directionStyle = css`
		flex-direction: ${direction};
		height: 100%;
	`;

	const result = (
		<div class={[base, directionStyle].join(' ')}>
			{children.map((c, index) => (
				<div
					class={[
						distro[distribute[index] ?? 'grow'],
						dividers && dividerStyles,
					]
						.filter(Boolean)
						.join(' ')}>
					{padding ? <Padding size={padding}>{c}</Padding> : c}
				</div>
			))}
		</div>
	);

	if (direction === 'row') {
		return <FlexList direction="column">{[result]}</FlexList>;
	}
	return result;
};

export { FlexList as Flex };
