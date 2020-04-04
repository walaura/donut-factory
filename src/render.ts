import { GameState, AgentState } from './defs';
import './game.css';
//@ts-ignore
import { html, render } from 'lit-html';
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

const renderGame = (state: GameState) => {
	logger.innerText = JSON.stringify(state, null, 2);
	render(html`<div>${state.agents.map((a) => Agent(a.state))}</div>`, game);
	render(html`<div>dsfdsf${new Date(state.date)}</div>`, statusbaar);
};

export default renderGame;
