import { html } from 'lit-html';
import { css } from '../../helper/style';
import { $padding } from '../$padding';

const $row = (children) =>
	$padding(children, { type: 'padding', size: 'normal' });

const $rows = (children: any[], { breakout = true } = {}) => {
	const styles = css`
		& > * {
			box-shadow: 0 1px 0 0 var(--divider);
		}
	`;

	if (breakout) {
		return $padding(
			html` <x-rows class=${styles}>
				${children.map($row)}
			</x-rows>`,
			{ type: 'antiPadding', size: 'normal' }
		);
	}

	return html` <x-rows class=${styles} data-breakout=${breakout}>
		${children.map($row)}
	</x-rows>`;
};

export { $rows };
