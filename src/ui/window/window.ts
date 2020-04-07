import { html, render } from 'lit-html';
import { draggable } from '../helper/draggable';
import { useState } from '../helper/useState';
import { $emoji } from './components/emoji';
import { $rows } from './rows/row';

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
	${$rows(items, { breakout: false })}
</xw-body>`;

const $xwHeader = ({ dragHandle, emoji, title, onClose }) => html`<style>
		xw-header {
			font-weight: var(--font-bold);
			transform: lowercase;
			color: var(--bg-dark);
			padding: var(--space-v) 0;
			min-height: var(--pressable);
			display: grid;
			border-radius: var(--radius-small);
			grid-template-columns: calc(var(--pressable)) 1fr calc(var(--pressable));
			align-items: center;
			justify-content: center;
			margin-bottom: 2px;
			cursor: pointer;
		}
		xw-header:hover {
			background: var(--bg-tabbar);
		}
		xw-header-title {
			transform: translate(0, 0.1em);
		}
		xw-header-icon {
			display: grid;
			align-items: center;
			justify-content: center;
			transform: scale(1.25);
		}
	</style>
	<xw-header @mousedown=${dragHandle}>
		<xw-header-icon>${$emoji(emoji)}</xw-header-icon>
		<xw-header-title>${title}</xw-header-title>
		<xw-header-icon @click=${onClose}>
			x
		</xw-header-icon>
	</xw-header>`;

const $windowBase = ({ emoji, title, children, x = 20, y = 20 }) => {
	const { dragHandle, $draggable } = draggable({ x, y });
	return $draggable(html`<style>
			@keyframes pop {
				from {
					transform: scale(0.8) translateY(-10%);
				}
				to {
					transform: scale(1) translateY(0);
				}
			}
			x-window {
				animation: pop 0.1s;
				transform-origin: 50% 20%;
				contain: content;
				z-index: 9999999;
				border-radius: var(--radius);
				padding: 2px;
				display: flex;
				flex-direction: column;
				box-shadow: var(--shadow-1);
				overflow: hidden;
				width: 20em;
				max-height: 30em;
				height: 100%;
				background: var(--bg-light);
			}
			x-tabbar {
				grid-row: min-content;
			}
			xw-body {
				border-radius: var(--radius-small);
				overflow: scroll;
				background: var(--bg);
				display: grid;
				height: 100%;
				grid-template-columns: 1fr;
			}
		</style>
		<x-window>
			${$xwHeader({
				dragHandle,
				title,
				emoji,
				onClose: () => {
					$dockRef.childNodes.item(0).remove();
				},
			})}
			${children}
		</x-window>`);
};

interface WindowTab {
	name: string;
	emoji: string;
	contents: any;
}

export const $tabbedWindow = (
	emoji: any,
	title: any,
	children: WindowTab[]
) => {
	const useTabState = useState(0);

	return $windowBase({
		emoji,
		title,
		children: useTabState((activeTab, setActiveTab) => {
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
		}),
	});
};

export const $window = (emoji: any, title: any, children: any[]) =>
	$windowBase({ emoji, title, children: $xwBody(children) });
