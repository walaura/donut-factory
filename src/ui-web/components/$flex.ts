import { html } from 'lit-html';
import { css } from '../helper/style';
import { TemplateHole } from '../helper/defs';

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

const $flex = (
	children: TemplateHole[] = [],
	{
		distribute = ['grow'],
		direction = 'column',
		dividers = true,
	}: {
		distribute?: (keyof typeof distro)[];
		direction?: 'row' | 'column';
		dividers?: boolean;
	} = {}
) => {
	const directionStyle = css`
		flex-direction: ${direction};
		height: 100%;
	`;

	const result = html`<div class=${[base, directionStyle].join(' ')}>
		${children.map(
			(c, index) =>
				html`<div
					class=${[
						distro[distribute[index] ?? 'grow'],
						dividers && dividerStyles,
					]
						.filter(Boolean)
						.join(' ')}
				>
					${c}
				</div>`
		)}
	</div>`;

	if (direction === 'row') {
		return $flex([result], {
			direction: 'column',
		});
	}
	return result;
};

export { $flex };
