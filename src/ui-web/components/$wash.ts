import { css } from '../helper/style';
import { TemplateHole } from '../helper/defs';
import { styleMap } from 'lit-html/directives/style-map';
import { html } from 'lit-html';

const corners = {
	topLeft: 'borderTopLeftRadius',
	topRight: 'borderTopRightRadius',
	bottomLeft: 'borderBottomLeftRadius',
	bottomRight: 'borderBottomRightRadius',
};

type SquareOff = (keyof typeof corners)[];

export const $wash = (
	items: TemplateHole,
	{
		squareOff = [],
		counter = false,
	}: { squareOff?: SquareOff; counter?: boolean } = {}
) => {
	const styles = css`
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
	const inline = styleMap(
		Object.fromEntries(squareOff.map((key) => [corners[key], 0]))
	);
	return html`<div style=${inline} class=${styles}>
		${items}
	</div>`;
};
