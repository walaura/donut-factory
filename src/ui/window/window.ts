import { GameState } from '../../helper/defs';
import { TemplateResult, html, Part, render } from 'lit-html';
import { draggable } from '../helper/draggable';

let windows = [];

export const getAllWindows = () => windows;
const $dockRef = document.createElement('x-window-dock');

export const addDynamicWindow = (window) => {
	let $holder = document.createElement('no-op');
	$dockRef.appendChild($holder);
	render(window, $holder);
};

export const $windowDock = () => {
	return html`${$dockRef}`;
};

const $xwBody = (items: any[]) => html`<xw-body>
	${items.map((result) => html`<xw-body-row>${result}</xw-body-row>`)}
</xw-body>`;

type Windowtab = {
	name: string;
	emoji: string;
	contents: any;
};
export const $tabbedWindow = (
	emoji: any,
	title: any,
	children: Windowtab[]
) => {
	const { dragHandle, $draggable } = draggable({ x: 20, y: 20 });

	let $ref = document.createElement('xw-tabs-ref');
	let onSelect = (id) => {
		render($xwBody(children[id].contents), $ref);
	};
	onSelect(0);
	return $draggable(html`<x-window>
		<xw-header @mousedown=${dragHandle}>
			<xw-header-icon>${emoji}</xw-header-icon>
			<xw-header-title>${title}</xw-header-title>
			<xw-header-icon
				@click=${() => {
					$dockRef.childNodes.item(0).remove();
				}}
			>
				x
			</xw-header-icon>
		</xw-header>
		<xw-tabs>
			<x-tabbar>
				${children.map((t, i) => {
					const $btn = document.createElement('button');
					$btn.innerText = t.emoji;
					$btn.title = t.name;
					$btn.onclick = () => onSelect(i);
					return html`${$btn}`;
				})}
			</x-tabbar>
			${html`${$ref}`}
		</xw-tabs>
	</x-window>`);
};

export const $window = (emoji: any, title: any, children: any[]) => {
	const { dragHandle, $draggable } = draggable({ x: 20, y: 20 });
	return $draggable(html`<x-window>
		<xw-header @mousedown=${dragHandle}>
			<xw-header-icon>${emoji}</xw-header-icon>
			<xw-header-title>${title}</xw-header-title>
			<xw-header-icon
				@click=${() => {
					$dockRef.childNodes.item(0).remove();
				}}
			>
				x
			</xw-header-icon>
		</xw-header>
		${$xwBody(children)}
	</x-window>`);
};
