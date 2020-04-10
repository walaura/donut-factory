import { html, render } from 'lit-html';
import { XY } from '../../helper/xy';
import { $button } from '../components/$button';
import { $flex } from '../components/$flex';
import { $padding } from '../components/$padding';
import { $wash } from '../components/$wash';
import { $t } from '../components/type';
import { TemplateHole } from '../helper/defs';
import { css } from '../helper/style';
import {
	$windowBase,
	CallableWindowRoute,
	generateCallableWindowFromEv,
} from './$window';

const styles = css`
	display: grid;
	height: 100%;
	width: 100%;
	grid-template-columns: 40% 60%;
	grid-gap: 2px;
	grid-auto-rows: 100%;
	* > * {
		position: relative;
	}
	& > *:first-child {
		--bg: #eee;
	}
`;

export const $detailViewWindow = (
	callable: CallableWindowRoute,
	{ x, y, onClose }: Partial<XY> & { onClose: () => void }
): TemplateHole => {
	const $targetRef = document.createElement('x-haha');
	const $originRef = document.createElement('x-haha');
	[$targetRef, $originRef].forEach(($el) => {
		$el.style.height = '100%';
		$el.style.position = 'absolute';
		$el.style.top = '0px';
		$el.style.left = '0px';
		$el.style.bottom = '0px';
		$el.style.right = '0px';
	});
	if (!onClose) {
		onClose = () => {};
	}
	const onNavigate = (ev) => (navigator: CallableWindowRoute | undefined) => {
		render(
			callable.render({ onNavigate, onClose, selectedNavigator: navigator }),
			$originRef
		);

		if (!navigator) {
			render('', $targetRef);
			return;
		}

		render(
			$flex(
				[
					$padding(
						html`<div
							class=${css`
								display: grid;
								grid-template-columns: 1fr min-content;
							`}
						>
							<span>${$t(navigator as any)}</span>
							${$button('pop', {
								onClick: () => {
									onNavigate(ev)(undefined);
									generateCallableWindowFromEv(ev)(navigator);
								},
							})}
						</div>`
					),
					$padding(
						navigator.render({
							onNavigate: generateCallableWindowFromEv,
							onClose,
						}),
						{ size: 'small' }
					),
				],
				{ distribute: ['squish', 'grow'], dividers: false }
			),
			$targetRef
		);
	};

	render(callable.render({ onNavigate, onClose }), $originRef);

	return $windowBase({
		x,
		y,
		onClose,
		width: 2,
		...callable,
		children: html`<div class=${styles}>
			<div data-alt-colors>${$originRef}</div>
			${$wash($targetRef)}
		</div>`,
	});
};
