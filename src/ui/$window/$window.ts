import { html, render } from 'lit-html';
import { ID } from '../../helper/defs';
import { $emoji } from '../components/emoji';
import { TemplateHole } from '../helper/defs';
import { draggable } from '../helper/draggable';
import { css, keyframes } from '../helper/style';
import { $basicWindow } from './$basic-window';
import { $detailViewWindow } from './$detail-view-window';
import { XY } from '../../helper/xy';

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

const addDynamicWindow = (handle: (ref: HTMLElement) => TemplateHole) => {
	let $holder = document.createElement('no-op');
	$dockRef.appendChild($holder);

	$holder.__windowScope = {};
	render(handle($holder), $holder);
};

export interface BaseWindowProps {
	emoji: TemplateHole;
	name: TemplateHole;
	modal?: boolean;
	onClose?: () => void;
}

export type WindowScopeRef = { current: any };

export interface WindowCallbacks {
	onClose: () => void;
	onNavigate: (ev: MouseEvent) => (wndw: CallableWindowRoute) => void;
	selectedNavigator?: CallableWindowRoute;
	windowScope: WindowScopeRef;
}
export enum CallableWindowTypes {
	'Simple',
	'MasterDetail',
}

type Path =
	| ['info']
	| ['inspect-entity', ID]
	| ['all-entities']
	| ['ledger']
	| ['ONEOFF'];

export type CallableWindowRoute = BaseWindowProps & {
	type?: CallableWindowTypes;
	path: Path;
	render: (cb: WindowCallbacks) => TemplateHole;
};

export type WindowRendererProps = {
	at: XY;
	onClose: () => void;
	scope: WindowScopeRef;
};

export const generateCallableWindowFromEv = ({
	clientX: x,
	clientY: y,
}: MouseEvent) => (props: CallableWindowRoute) => {
	addDynamicWindow(($holder) => {
		const onClose = () => {
			$dockRef.dataset.withModal = undefined;
			$holder.remove();
		};
		if (false && props.type === CallableWindowTypes.MasterDetail) {
			return $detailViewWindow(props, { onClose, x, y });
		}
		debugger;
		return $basicWindow(props, {
			onClose,
			at: { x, y },
			scope: { current: $holder.__windowScope },
		});
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
		flex: 1 0 0;
		position: relative;
	`;
	return html`<xw-body class=${styles}>
		${items}
	</xw-body>`;
};

const $xwHeader = ({ dragHandle, emoji, title, onClose }) => {
	const styles = css`
		font-weight: var(--font-bold);
		transform: lowercase;
		color: var(--text-title);
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
	name: title,
	modal,
	onClose,
	children,
	x = 20,
	y = 20,
	width = 1,
}: BaseWindowProps & {
	children: TemplateHole;
	width?: number;
	x?: number;
	y?: number;
}): TemplateHole => {
	width = width * 260;
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
