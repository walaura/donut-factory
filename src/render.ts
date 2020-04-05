import { findAgent } from './loop/loop';
import { html, render, svg, TemplateResult } from 'lit-html';
//@ts-ignore
import { styleMap } from 'lit-html/directives/style-map.js';
import { Agent, AgentStateType, GameState, Road, WithXY, ID } from './defs';
import './game.css';
import { midpoint } from './helper/xy';

//@ts-ignore
const { logger, game, statusbaar } = window;

const pretty = (str) => html`<pre>${JSON.stringify(str, null, 2)}</pre>`;

const icons = {
	exports: '📤',
	held: '📦',
	imports: '📥',
};

const Chip = (key: keyof typeof icons, state: Agent) => {
	if (!state[key]) {
		return null;
	}
	const short = Math.round(state[key] * 10) / 10;
	return html`<div>
		<small>${icons[key]}</small>
		${short}
	</div>`;
};

const Info = (agentId: ID, gameState: GameState) => {
	const agent = findAgent(agentId, gameState);
	if (agent.type !== AgentStateType.MOVER) {
		return;
	}
	if (agent.path.length === 0) {
		return html`stuck or loading/unloading`;
	}
	if (agent.held <= 0) {
		return html`On their way to ${findAgent(agent.from[0], gameState).emoji}`;
	} else {
		return html`delivering ${agent.held} boxes to
		${findAgent(agent.from[0], gameState).emoji}`;
	}
};

const MkAgent = (agent: Agent, gameState: GameState) => {
	const style = styleMap({
		transform: `translate(${agent.x * 10}px, ${
			agent.y * 10
		}px) translate(-50%, -50%)`,
	});
	const status = Object.keys(icons)
		.map((key) => Chip(key as keyof typeof icons, agent))
		.filter(Boolean);

	let controller = MkWindow(
		agent.emoji,
		'Agent info',
		(gameState) =>
			html`${Info(agent.id, gameState)}
				<hr />
				${pretty(agent)}`
	);
	return html`<x-unit
		@click=${() => {
			windows.push(controller);
		}}
		style="${style}"
	>
		<x-moji>${agent.emoji}</x-moji>
		${status && html`<x-status>${status}</x-status>`}
	</x-unit>`;
};

const MkRoad = (road: Road) => {
	const start = {
		x: road.start.x * 10,
		y: road.start.y * 10,
	};
	const end = {
		x: road.end.x * 10,
		y: road.end.y * 10,
	};

	const mid = midpoint(start, end);

	return svg`
	  <text x=${mid.x} y=${mid.y}>${road.name}</text>
		<line
			x1="${start.x}"
			y1="${start.y}"
			x2="${end.x}"
			y2="${end.y}"
			stroke="black"
		/>
	`;
};

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
		<svg
			width=${state.width * 10}
			height=${state.height * 10}
			xmlns="http://www.w3.org/2000/svg"
		>
			${Object.values(state.roads).map(MkRoad)}}
		</svg>
		${Object.values(state.agents).map((a) => MkAgent(a, state))}
		${windows.map((w) => w(state))} ${Tools(state)}
	`;

let windows = [];

const Tools = (state: GameState) => {
	let date = new Date(state.date);
	const dtf = new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
	const clock = new Intl.DateTimeFormat('en', {
		hour: 'numeric',
		minute: 'numeric',
	});

	return html`<x-dock>
		<button
			as="x-dock-panel"
			@click=${() => {
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
			}}
		>
			<xdp-emoji><span>📆</span></xdp-emoji>
			<xdp-text>${dtf.format(date)}</xdp-text>
			<xdp-text>${clock.format(date)}</xdp-text>
		</button>
		<x-dock-panel>
			<button
				as="xdp-emoji"
				@click=${() => {
					console.log('not yet lol');
				}}
			>
				<span>${state.paused ? '▶️' : '⏸'}</span>
			</button>
			<button
				@click=${() => {
					windows.push(MkWindow('🤓', 'All state', (state) => pretty(state)));
				}}
				title="Show global state"
				as="xdp-emoji"
			>
				<span>🤓</span>
			</button>
		</x-dock-panel>
	</x-dock>`;
};

const renderGame = (state: GameState) => {
	render(Board(state), game);
	//	render(html`<div>${new Date(state.date)}</div>`, statusbaar);
};

export default renderGame;
