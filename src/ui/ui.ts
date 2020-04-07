import { html, render } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import { MoverAgent } from '../agent/mover';
import { Agent, AgentStateType, GameState, ID } from '../helper/defs';
import {
	listenFromWindow,
	LoopWorkerMessage,
	MsgActions,
	WorldWorkerMessage,
	postFromWindow,
} from '../helper/message';
import { Target } from '../helper/pathfinding';
import { findAgent, mutateAgent } from '../loop/loop';
import './game.css';
import { numberWithCommas, shortNumber } from './helper/format';
import {
	onStateUpdate,
	UIStatePriority,
	useGameState,
} from './helper/useGameState';
import { $agentWindow } from './window/agentWindow';
import { $moneyWindow } from './window/moneyWindow';
import { $pretty } from './window/rows/pretty';
import { $window, $windowDock, addDynamicWindow } from './window/window';
import { $agentsWindow } from './window/agentsWindow';

const Board = () => html`${$windowDock()}${Tools()} `;

const Tools = () => {
	return html`<x-dock>
		<button
			as="x-dock-panel"
			@click=${() => {
				addDynamicWindow($moneyWindow());
			}}
		>
			<xdp-emoji><span>💰</span></xdp-emoji>
			<xdp-text>
				${useGameState(
					(state) =>
						numberWithCommas(
							state.ledger.map(({ tx }) => tx).reduce((a, b) => a + b)
						),
					UIStatePriority.Bunny
				)}
			</xdp-text>
		</button>
		<button
			as="x-dock-panel"
			@click=${() => {
				addDynamicWindow($window('📅', 'Date', [12]));
			}}
		>
			<xdp-emoji><span>📆</span></xdp-emoji>
			${useGameState((state) => {
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
				return html`<xdp-text>${dtf.format(date)}</xdp-text>
					<xdp-text>${clock.format(date)}</xdp-text>`;
			}, UIStatePriority.UI)}
		</button>
		<x-dock-panel>
			<button
				as="xdp-emoji"
				@click=${() => {
					addDynamicWindow($agentsWindow());
				}}
			>
				<span>
					🌈
				</span>
			</button>
			<button
				@click=${() => {
					addDynamicWindow(
						$window('🤓', 'All state', [
							useGameState((state) => $pretty(state)),
						])
					);
				}}
				title="Show global state"
				as="xdp-emoji"
			>
				<span>🤓</span>
			</button>
		</x-dock-panel>
	</x-dock>`;
};

const renderSetup = () => {
	render(Board(), (window as any).game);
	const onTick = (state: GameState) => {
		onStateUpdate(state);
		worker.postMessage({ action: 'TOCK', state } as LoopWorkerMessage);
	};
	let selected: Target;

	const pixelRatio = 1.5;
	const $canvas = (window as any).floor as HTMLCanvasElement;
	$canvas.width = window.innerWidth * pixelRatio;
	$canvas.height = window.innerHeight * pixelRatio;
	$canvas.style.width = window.innerWidth + 'px';
	$canvas.style.height = window.innerHeight + 'px';
	const offscreenCanvas = $canvas.transferControlToOffscreen();
	$canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
		worker.postMessage({
			action: MsgActions.SEND_CURSOR,
			pos: { x, y },
		} as WorldWorkerMessage);
	});
	$canvas.addEventListener('click', () => {
		if ('agentId' in selected) {
			addDynamicWindow($agentWindow(selected.agentId));
		}
	});

	const worker = new Worker('../world.wk.ts');
	worker.postMessage(
		{
			action: MsgActions.SEND_CANVAS,
			canvas: offscreenCanvas,
			pixelRatio,
		} as WorldWorkerMessage,
		[offscreenCanvas]
	);
	listenFromWindow<WorldWorkerMessage>((msg) => {
		if (msg.action === MsgActions.CANVAS_RESPONSE) {
			selected = msg.rendererState.selected;
		}
	}, worker);

	return onTick;
};

export default renderSetup;
