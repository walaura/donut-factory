import { render, html } from 'lit-html';
import { GameState } from '../helper/defs';
import {
	listenFromWindow,
	LoopWorkerMessage,
	MsgActions,
	WorldWorkerMessage,
} from '../helper/message';
import { Target } from '../helper/pathfinding';
import { $dock } from './$dock';
import { $windowDock, generateWindowEv } from './$window';
import { onStateUpdate } from './helper/useGameState';
import { agentInspector } from './inspectors/agent-inspector';
import { $compatError } from './$compaterror';

const Board = () => [$compatError(), $windowDock(), $dock()];

let worker;
const renderSetup = () => {
	render(Board(), (window as any).game);
	let onTick = (state: GameState) => {
		onStateUpdate(state);
		if (worker) {
			worker.postMessage({ action: 'TOCK', state } as LoopWorkerMessage);
		}
	};
	let selected: Target;

	const pixelRatio = 1.5;
	const $canvas = (window as any).floor as HTMLCanvasElement;
	$canvas.width = window.innerWidth * pixelRatio;
	$canvas.height = window.innerHeight * pixelRatio;
	$canvas.style.width = window.innerWidth + 'px';
	$canvas.style.height = window.innerHeight + 'px';

	if (!('transferControlToOffscreen' in $canvas)) {
		return onTick;
	}

	const offscreenCanvas = $canvas.transferControlToOffscreen();
	$canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
		worker.postMessage({
			action: MsgActions.SEND_CURSOR,
			pos: { x, y },
		} as WorldWorkerMessage);
	});
	$canvas.addEventListener('click', (ev) => {
		if ('entityId' in selected) {
			generateWindowEv(ev)(agentInspector(selected.entityId));
		}
	});

	worker = new Worker('../ui-canvas/world.wk.ts');
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