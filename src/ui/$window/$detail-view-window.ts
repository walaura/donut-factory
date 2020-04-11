import { html, render } from 'lit-html';
import { XY } from '../../helper/xy';
import { $button } from '../components/$button';
import { $flex } from '../components/$flex';
import { $padding } from '../components/$padding';
import { $wash } from '../components/$wash';

import { TemplateHole } from '../helper/defs';
import { css } from '../helper/style';
import {
	$windowBase,
	CallableWindowRoute,
	generateCallableWindowFromEv,
	WindowRendererProps,
	WindowScopeRef,
} from './$window';
import { $emoji } from '../components/$emoji';
import { useState } from '../helper/useState';

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
	{ at: { x, y }, onClose, scope }: WindowRendererProps
): TemplateHole => {
	if (!onClose) {
		onClose = () => {};
	}

	const useNavView = useState<TemplateHole | null>(null);
	const useChildView = useState<TemplateHole | null>(null);

	const children = useNavView((navView, setNavView) =>
		useChildView((childView, setChildView) => {
			const onNavigate = (ev) => (
				navigator: CallableWindowRoute | undefined
			) => {
				setNavView(
					callable.render({
						onNavigate,
						onClose,
						selectedNavigator: navigator,
						scope,
					})
				);
				if (navigator) {
					setChildView(
						$flex(
							[
								$padding(
									html`<div
										class=${css`
											display: grid;
											grid-template-columns: 1fr min-content;
										`}
									>
										<span>${$emoji(navigator.emoji)} ${navigator.name}</span>
										${$button('pop', {
											onClick: () => {
												onNavigate(ev)(undefined);
												generateCallableWindowFromEv(ev)(navigator);
											},
										})}
									</div>`
								),
							],
							{ distribute: ['squish', 'grow'], dividers: false }
						)
					);
				}
			};
			if (!navView) {
				setNavView(
					callable.render({
						onNavigate,
						onClose,
						selectedNavigator: undefined,
						scope,
					})
				);
			}
			return html`<div class=${styles}>
				<div data-alt-colors>${navView}</div>
				${$wash(childView)}
			</div>`;
		})
	);

	return $windowBase({
		x,
		y,
		onClose,
		width: 2,
		...callable,
		children,
	});
};
