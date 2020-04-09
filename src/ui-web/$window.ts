import { Tabset, $tabset } from './components/$tabset';
import { html, render, TemplateResult } from 'lit-html';
import { draggable } from './helper/draggable';
import { useState } from './helper/useState';
import { $emoji } from './components/emoji';
import { $rows } from './components/rows/row';
import { css, keyframes } from './helper/style';
import { TemplateHole } from './helper/defs';
import { XY } from '../helper/xy';

let windows = [];

export const getAllWindows = () => windows;
const $dockRef = document.createElement('x-window-dock');
$dockRef.className = css`
	&[data-with-modal='true'] x-window:not([data-modal='true']) {
		pointer-events: none;
		transform: scale(0.8);
		opacity: 0.5;
	}
`;

interface WindowTab {
	name: string;
	emoji: string;
	contents: TemplateHole;
	shows?: boolean | any;
}

interface BaseWindowProps {
	emoji: TemplateHole;
	title: TemplateHole;
	modal?: boolean;
	onClose?: () => void;
}

export interface WindowCallbacks {
	onClose: () => void;
}

export interface ListWindowProps extends BaseWindowProps {
	list: TemplateHole[];
}

export interface TabbedWindowProps extends BaseWindowProps, Tabset {}

type WindowProps = ListWindowProps | TabbedWindowProps;

const addDynamicWindow = (handle: (ref: HTMLElement) => TemplateHole) => {
	let $holder = document.createElement('no-op');
	$dockRef.appendChild($holder);
	render(handle($holder), $holder);
};

export const generateWindowEv = ({ clientX: x, clientY: y }: MouseEvent) => (
	windowProps: WindowProps | ((cbs: WindowCallbacks) => WindowProps)
) => {
	addDynamicWindow((parentRef) => {
		const onClose = () => {
			$dockRef.dataset.withModal = undefined;
			parentRef.remove();
		};

		if (typeof windowProps === 'function') {
			windowProps = windowProps({
				onClose,
			});
		}

		if ('tabs' in windowProps) {
			return $tabbedWindow({ ...windowProps, onClose }, { x, y });
		}
		return $listWindow({ ...windowProps, onClose }, { x, y });
	});
};

export const $windowDock = () => {
	return html`${$dockRef}`;
};

const $body = (items: TemplateHole) => {
	const styles = css`
		overflow: hidden;
		display: flex;
		height: 100%;
		width: 100%;
		justify-content: stretch;
		align-items: stretch;
		flex: 1 1 0;
	`;
	return html`<xw-body class=${styles}>
		${items}
	</xw-body>`;
};

export const $windowWash = (items: TemplateHole) => {
	const styles = css`
		border-radius: var(--radius-small);
		background: var(--bg);
		width: 100%;
	`;
	return html`<div class=${styles}>
		${items}
	</div>`;
};

const $xwHeader = ({ dragHandle, emoji, title, onClose }) => {
	const styles = css`
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

		xw-header-title {
			transform: translate(0, 0.1em);
		}
		xw-header-icon {
			display: grid;
			align-items: center;
			justify-content: center;
			transform: scale(1.25);
		}
		xw-close {
			transform: scale(2) rotate(45deg);
			display: grid;
			align-items: center;
			justify-content: center;
			fill: currentColor;
		}
	`;
	return html` <xw-header class=${styles} @mousedown=${dragHandle}>
		<xw-header-icon>${$emoji(emoji)}</xw-header-icon>
		<xw-header-title>${title}</xw-header-title>
		${onClose &&
		html`<xw-close @click=${onClose}>
			<svg width="5px" height="5px" xmlns="http://www.w3.org/2000/svg">
				<rect x="0" y="2" width="5" height="1"></rect>
				<rect x="2" y="0" width="1" height="5"></rect>
			</svg>
		</xw-header-icon>`}
	</xw-header>`;
};

export const $windowBase = ({
	emoji,
	title,
	modal,
	onClose,
	children,
	x = 20,
	y = 20,
}: BaseWindowProps & {
	children: TemplateHole;
	x?: number;
	y?: number;
}): TemplateHole => {
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
		transition: transform 0.1s;
		animation: ${pop} 0.1s;
		transform-origin: 50% 20%;
		contain: content;
		z-index: 9999999;
		border-radius: var(--radius);
		padding: 2px;
		display: grid;

		grid-template-rows: min-content 1fr;
		box-shadow: var(--shadow-1);
		overflow: hidden;
		width: ${width}px;
		height: 30em;
		background: var(--bg-light);
	`;
	if (modal) {
		$dockRef.dataset.withModal = 'true';
	}

	return $draggable(html`<x-window class=${styles} data-modal=${modal}>
		${$xwHeader({
			dragHandle,
			title,
			emoji,
			onClose,
		})}
		${$body(children)}
	</x-window>`);
};

const $tabbedWindow = (
	{ tabs, ...windowProps }: TabbedWindowProps,
	{ x, y }: Partial<XY> = {}
): TemplateHole => {
	return $windowBase({
		...windowProps,
		x,
		y,
		children: $tabset({ tabs }),
	});
};

const $listWindow = (
	{ list, ...windowProps }: ListWindowProps,
	{ x, y }: Partial<XY> = {}
) => {
	return $windowBase({
		x,
		y,
		...windowProps,
		children: $body($rows(list as any, { breakout: false })),
	});
};
