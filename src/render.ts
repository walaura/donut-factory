import {
	GameState,
	AgentState,
	Agent as AgentT,
	WithXY,
	Road,
	AgentType,
} from './defs';
import './game.css';

import { html, svg, render, directive, TemplateResult } from 'lit-html';
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

const Info = (agent: AgentT) => {
	if (agent.state.type !== AgentType.MOVER) {
		return;
	}
	if (agent.state.path.length === 0) {
		return html`stuck or loading/unloading`;
	}
	if (agent.state.held <= 0) {
		return html`On their way to ${agent.state.from[0].state.emoji}`;
	} else {
		return html`delivering ${agent.state.held} boxes to
		${agent.state.to[0].state.emoji}`;
	}
};

const Agent = (agent: AgentT, gameState: GameState) => {
	const { state } = agent;
	const style = styleMap({
		transform: `translate(${state.x * 10}px, ${
			state.y * 10
		}px) translate(-50%, -50%)`,
	});
	const status = Object.keys(icons)
		.map((key) => Chip(key as keyof typeof icons, state))
		.filter(Boolean);

	const agentIndex = gameState.agents.indexOf(agent);
	let controller = MkWindow(
		state.emoji,
		'Agent info',
		(gameState) =>
			html`${Info(gameState.agents[agentIndex])}
				<hr />
				<pre>${JSON.stringify(gameState.agents[agentIndex], null, 2)}</pre>`
	);
	return html`<x-unit
		@click=${() => {
			windows.push(controller);
		}}
		style="${style}"
	>
		<x-moji>${state.emoji}</x-moji>
		${status && html`<x-status>${status}</x-status>`}
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

const MkWindow = (
	emoji: string,
	title: string,
	renderer: (state: GameState) => TemplateResult | string
) => {
	const { dragHandle, $draggable } = useDraggable({ x: 20, y: 20 });
	return (state: GameState) =>
		$draggable(html`<x-window>
			<x-window-header @mousedown=${dragHandle}>
				<x-window-header-icon>${emoji}</x-window-header-icon>
				<x-window-header-title>${title}</x-window-header-title>
				<x-window-header-icon @click=${() => windows.pop()}
					>x</x-window-header-icon
				>
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
		${state.agents.map((a) => Agent(a, state))}
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
	render(Board(state), game);
	//	render(html`<div>${new Date(state.date)}</div>`, statusbaar);
};

export default renderGame;
