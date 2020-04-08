import { html, render, TemplateResult } from 'lit-html';
import { draggable } from '../helper/draggable';
import { useState } from '../helper/useState';
import { $emoji } from '../components/emoji';
import { $rows } from '../components/rows/row';
import { css, keyframes } from '../helper/style';
import { TemplateHole } from '../helper/defs';
import { XY } from '../../helper/xy';

let windows = [];

export const getAllWindows = () => windows;
const $dockRef = document.createElement('x-window-dock');

interface WindowTab {
	name: string;
	emoji: string;
	contents: any;
}

interface BaseWindowProps {
	emoji: TemplateHole;
	title: TemplateHole;
}

export interface ListWindowProps extends BaseWindowProps {
	list: TemplateHole[];
}

export interface TabbedWindowProps extends BaseWindowProps {
	tabs: WindowTab[];
}

type WindowProps = ListWindowProps | TabbedWindowProps;

export const addDynamicWindow = (window) => {
	let $holder = document.createElement('no-op');
	$dockRef.appendChild($holder);
	render(window, $holder);
};

export const generateWindowEv = ({ clientX: x, clientY: y }: MouseEvent) => (
	windowProps: WindowProps
) => {
	if ('tabs' in windowProps) {
		addDynamicWindow($tabbedWindow(windowProps, { x, y }));
	} else {
		addDynamicWindow($listWindow(windowProps, { x, y }));
	}
};

export const generateWindow = (windowProps: TabbedWindowProps) => {
	addDynamicWindow($tabbedWindow(windowProps));
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
	const width = 260;
	x = x + Math.min(0, document.body.clientWidth - x - width - 40);
	if (x > document.body.clientWidth / 2) {
		y = Math.max(y, 100);
	}
	const { dragHandle, $draggable } = draggable({ x: x, y });
	const pop = keyframes`
			from {
				transform: scale(0.8) translateY(-10%);
			}
			to {
				transform: scale(1) translateY(0);
			}
	`;

	const styles = css`
		animation: ${pop} 0.1s;
		transform-origin: 50% 20%;
		contain: content;
		z-index: 9999999;
		border-radius: var(--radius);
		padding: 2px;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-1);
		overflow: hidden;
		width: ${width}px;
		max-height: 30em;
		height: 100%;
		background: var(--bg-light);

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
	`;
	return $draggable(html` <x-window class=${styles}>
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

const $tabbedWindow = (
	{ emoji, title, tabs: children }: TabbedWindowProps,
	{ x, y }: Partial<XY> = {}
) => {
	const useTabState = useState(0);

	return $windowBase({
		emoji,
		title,
		x,
		y,
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

const $listWindow = (
	{ emoji, title, list }: ListWindowProps,
	{ x, y }: Partial<XY> = {}
) => $windowBase({ x, y, emoji, title, children: $xwBody(list) });
