import { h } from 'preact';
import { css } from '../../helper/style';
import { Padding, PaddingSize } from '../primitives/padding';

const mkTemplate = (sideways, template) =>
	`grid-template-${sideways ? 'columns' : 'rows'}: ${template.join(' ')}`;

const base = (sideways, template) => css`
	display: grid;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	contain: strict;
	height: 100%;
	grid-auto-flow: ${sideways ? 'row' : 'column'};
	${mkTemplate(sideways, template)};
	& > * {
		overflow: hidden;
		position: relative;
		contain: layout;
		height: 100%;
	}
`;

const gridDistro = {
	grow: '1fr',
	scroll: '1fr',
	squish: 'min-content',
};

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
	const result = (
		<div
			data-cssid="grid"
			class={base(
				direction === 'row',
				distribute.map((d) => gridDistro[d])
			)}>
			{children.map((c, index) => (
				<div
					class={[distro[distribute[index]], dividers && dividerStyles]
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
