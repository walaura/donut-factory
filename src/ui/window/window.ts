import { GameState } from '../../helper/defs';
import { TemplateResult, html, Part, render, directive } from 'lit-html';
import { draggable } from '../helper/draggable';
import { $emoji } from './components/emoji';
import { useState } from '../helper/useState';

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

const $xwHeader = ({ dragHandle, emoji, title, onClose }) => html` <xw-header
	@mousedown=${dragHandle}
>
	<xw-header-icon>${$emoji(emoji)}</xw-header-icon>
	<xw-header-title>${title}</xw-header-title>
	<xw-header-icon @click=${onClose}>
		x
	</xw-header-icon>
</xw-header>`;

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
	const useTabState = useState(0);

	return $draggable(html`<x-window>
		${$xwHeader({
			dragHandle,
			title,
			emoji,
			onClose: () => {
				$dockRef.childNodes.item(0).remove();
			},
		})}
		${useTabState((activeTab, setActiveTab) => {
			return html`
				<x-tabbar>
					${children.map((t, i) => {
						return html`<button
							data-active=${i === activeTab}
							@click=${() => setActiveTab(i)}
							title=${t.name}
						>
							${$emoji(t.emoji)}
						</button>`;
					})}
				</x-tabbar>
				${children.map((tab, index) => {
					if (index === activeTab) {
						return $xwBody(tab.contents);
					}
					return null;
				})}
			`;
		})}
	</x-window>`);
};

export const $window = (emoji: any, title: any, children: any[]) => {
	const { dragHandle, $draggable } = draggable({ x: 20, y: 20 });
	return $draggable(html`<x-window>
		${$xwHeader({
			dragHandle,
			title,
			emoji,
			onClose: () => {
				$dockRef.childNodes.item(0).remove();
			},
		})}
		${$xwBody(children)}
	</x-window>`);
};
