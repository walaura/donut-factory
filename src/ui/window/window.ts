import { GameState } from '../../defs';
import { TemplateResult, html } from 'lit-html';
import { draggable } from '../helper/draggable';

let windows = [];

export const getAllWindows = () => windows;

export const addDynamicWindow = (window) => {
	windows.push(window);
};

export const $window = (
	emoji: string,
	title: string,
	renderer: (state: GameState) => (TemplateResult | string)[]
) => {
	const { dragHandle, $draggable } = draggable({ x: 20, y: 20 });
	return (state: GameState) =>
		$draggable(html`<x-window>
			<x-window-header @mousedown=${dragHandle}>
				<x-window-header-icon>${emoji}</x-window-header-icon>
				<x-window-header-title>${title}</x-window-header-title>
				<x-window-header-icon @click=${() => windows.pop()}
					>x</x-window-header-icon
				>
			</x-window-header>
			<x-window-body
				>${renderer(state).map(
					(result) => html`<xw-row>${result}</xw-row>`
				)}</x-window-body
			>
		</x-window>`);
};
