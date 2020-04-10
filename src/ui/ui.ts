import { dispatchToCanvas } from './../global/dispatch';
import { render } from 'lit-html';
import { GameState } from '../helper/defs';
import {
	listenFromWindow,
	LoopWorkerMessage,
	MsgActions,
	CanvasRendererMessage,
} from '../helper/message';
import { Target } from '../helper/pathfinding';
import { $compatError } from './$compaterror';
import { $dock } from './$dock';
import { $windowDock, generateCallableWindowFromEv } from './$window/$window';
import { onStateUpdate } from './helper/useGameState';
import { entityInspector } from './inspectors/entity-inspector';
import { mergeEntity } from '../game/entities';
import { Road } from '../entity/road';
import { getWorker } from '../global/worker';

const Board = (worker) => [$compatError(), $windowDock(), $dock(worker)];

let worker;
let rendered = false;
const renderSetup = () => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}
	let onTick = (state: GameState) => {
		onStateUpdate(state);
		if (worker) {
			worker.postMessage({ action: 'TOCK', state } as LoopWorkerMessage);
			if (!rendered) {
				render(Board(worker), (window as any).game);
				rendered = true;
			}
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
		} as CanvasRendererMessage);
	});
	$canvas.addEventListener('click', (ev) => {
		if (self.memory.id !== 'MAIN') {
			throw 'no';
		}
		dispatchToCanvas({
			type: 'set-edit-mode',
			to: false,
		});
		if (self.memory.lastKnownCanvasState?.editMode) {
			let { gameCursor, editingTarget } = self.memory.lastKnownCanvasState;
			if ('roadEnd' in editingTarget) {
				mergeEntity<Road>(editingTarget.entityId, {
					[editingTarget.roadEnd]: gameCursor,
				});
			}
		}
		if ('entityId' in selected) {
			generateCallableWindowFromEv(ev)(entityInspector(selected.entityId));
		}
	});

	worker = getWorker('canvas');
	worker.postMessage(
		{
			action: MsgActions.SEND_CANVAS,
			canvas: offscreenCanvas,
			pixelRatio,
		} as CanvasRendererMessage,
		[offscreenCanvas]
	);
	listenFromWindow<CanvasRendererMessage>((msg) => {
		if (msg.action === MsgActions.CANVAS_RESPONSE) {
			if (self.memory.id !== 'MAIN') {
				throw 'no';
			}
			self.memory.lastKnownCanvasState = msg.rendererState;
		}
	}, worker);

	return onTick;
};

export default renderSetup;
