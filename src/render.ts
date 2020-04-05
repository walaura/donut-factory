import { GameState, AgentState, RoadasRoadT, WithXY, Road } from './defs';
import './game.css';

import { html, svg, render, directive } from 'lit-html';
//@ts-ignore
import { styleMap } from 'lit-html/directives/style-map.js';
//@ts-ignore
const { logger, game, statusbaar } = window;

const icons = {
	exports: '📤',
	held: '📦',
	imports: '📥',
};

const Chip = (key: keyof typeof icons, state: AgentState) => {
	if (!state[key]) {
		return null;
	}
	const short = Math.round(state[key] * 10) / 10;
	return html`<div>
		<small>${icons[key]}</small>
		${short}
	</div>`;
};

const Agent = (state: AgentState) => {
	const style = styleMap({
		top: state.y * 10 + 'px',
		left: state.x * 10 + 'px',
	});
	const status = Object.keys(icons)
		.map((key) => Chip(key as keyof typeof icons, state))
		.filter(Boolean);

	return html`<x-unit style="${style}">
		<x-moji>${state.emoji}</x-moji>
		${status && html`<x-status>${status}</x-status>`}
		<x-tip>${JSON.stringify(state, null, 2)}</x-tip>
	</x-unit>`;
};

const MkRoad = ({ state }: Road) =>
	svg`<line
		x1="${state.start.x * 10}"
		y1="${state.start.y * 10}"
		x2="${state.end.x * 10}"
		y2="${state.end.y * 10}"
		stroke="black"
	/>`;

const useDraggable = (pos: WithXY) => {
	let delta = { x: 0, y: 0 };
	let dragging = false;

	let handler = ({ screenX: x, screenY: y }) => {
		if (!dragging) {
			return;
		}
		pos.x = pos.x + x - delta.x;
		pos.y = pos.y + y - delta.y;

		delta = { x, y };
	};
	window.addEventListener('mouseup', () => {
		dragging = false;
	});
	window.addEventListener('mousemove', (ev) => {
		handler(ev);
	});
	const dragHandle = ({ screenX: x, screenY: y }) => {
		delta = { x, y };
		dragging = true;
	};
	const $draggable = (children) => html`<x-draggable
		style="--left: ${pos.x}px;--top: ${pos.y}px"
	>
		${children}
	</x-draggable>`;
	return { dragHandle, $draggable };
};

const MkWindow = (emoji, title, renderer) => {
	const { dragHandle, $draggable } = useDraggable({ x: 20, y: 20 });
	return (state: GameState) =>
		$draggable(html`<x-window>
			<x-window-header @mousedown=${dragHandle}>
				<x-window-header-emoji>${emoji}</x-window-header-emoji>
				<x-window-header-title>${title}</x-window-header-title>
			</x-window-header>
			<x-window-body>${renderer(state)}</x-window-body>
		</x-window>`);
};

const Board = (state: GameState) =>
	html`
		${windows.map((w) => w(state))}
		<svg
			width=${state.width * 10}
			height=${state.height * 10}
			xmlns="http://www.w3.org/2000/svg"
		>
			${state.roads.map(MkRoad)}}
		</svg>
		${state.agents.map((a) => Agent(a.state))}
	`;

let windows = [];
windows.push(
	MkWindow('📅', 'Date', (state: GameState) => {
		let date = new Date(state.date);
		const dtf = new Intl.DateTimeFormat('en', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});
		return dtf.format(date);
	})
);

const renderGame = (state: GameState) => {
	game.style.width = state.width * 10;
	game.style.height = state.height * 10;

	render(Board(state), game);
	//	render(html`<div>${new Date(state.date)}</div>`, statusbaar);
};

export default renderGame;
