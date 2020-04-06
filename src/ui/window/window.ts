import { GameState } from '../../helper/defs';
import { TemplateResult, html, Part, render } from 'lit-html';
import { draggable } from '../helper/draggable';

let windows = [];

export const getAllWindows = () => windows;
const $dockRef = document.createElement('x-window-dock');

export const addDynamicWindow = (window) => {
	windows.push(window);
	let $holder = document.createElement('no-op');
	$dockRef.appendChild($holder);
	render(window, $holder);
};

export const $windowDock = () => {
	return html`${$dockRef}`;
};

export const $window = (emoji: any, title: any, children: any[]) => {
	const { dragHandle, $draggable } = draggable({ x: 20, y: 20 });
	return $draggable(html`<x-window>
		<x-window-header @mousedown=${dragHandle}>
			<x-window-header-icon>${emoji}</x-window-header-icon>
			<x-window-header-title>${title}</x-window-header-title>
			<x-window-header-icon
				@click=${() => {
					$dockRef.childNodes.item(0).remove();
				}}
				>x</x-window-header-icon
			>
		</x-window-header>
		<x-window-body>
			${children.map((result) => html`<xw-row>${result}</xw-row>`)}
		</x-window-body>
	</x-window>`);
};
