import { GameState, AgentState, Road as RoadT } from './defs';
import './game.css';
//@ts-ignore
import { html, svg, render } from 'lit-html';
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

const Road = ({ state }: RoadT) =>
	svg`<line
		x1="${state.x1 * 10}"
		y1="${state.y1 * 10}"
		x2="${state.x2 * 10}"
		y2="${state.y2 * 10}"
		stroke="black"
	/>`;

const Board = (state: GameState) =>
	html`<svg
			width=${state.width * 10}
			height=${state.height * 10}
			xmlns="http://www.w3.org/2000/svg"
		>
			${state.roads.map(Road)} ${state.roads.map(Road)} ${state.roads.map(Road)}
		</svg>
		${state.agents.map((a) => Agent(a.state))}`;

const renderGame = (state: GameState) => {
	logger.innerText = JSON.stringify(state, null, 2);
	game.style.width = state.width * 10;
	game.style.height = state.height * 10;
	render(Board(state), game);
	render(html`<div>dsfdsf${new Date(state.date)}</div>`, statusbaar);
};

export default renderGame;
