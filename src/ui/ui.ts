import 'preact/debug';
import 'preact/devtools';
import { h, render } from 'preact';
import { Road } from '../entity/road';
import { mergeEntity } from '../game/entities';
import { getWorker } from '../global/worker';
import { GameState } from '../helper/defs';
import {
	CanvasRendererMessage,
	listenFromWindow,
	LoopWorkerMessage,
	MsgActions,
} from '../helper/message';
import { dispatchToCanvas } from './../global/dispatch';
import { onReactStateUpdate as onReactStateUpdate_GAME } from './hook/use-game-state';
import { onReactStateUpdate as onReactStateUpdate_CANVAS } from './hook/use-canvas-state';
import { UI } from './react-root';

let worker;
let rendered = false;
const renderSetup = () => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}
	let rendered = false;
	let onTick = (state: GameState) => {
		if (!rendered) {
			render(h(UI, {}), (window as any).overlays);
			rendered = true;
		}
		onReactStateUpdate_GAME(state);
		if (worker) {
			worker.postMessage({ action: 'TOCK', state } as LoopWorkerMessage);
		}
	};

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

	$canvas.onwheel = function (ev) {
		ev.preventDefault();

		dispatchToCanvas({
			type: 'pan-delta',
			pos: { x: ev.deltaX * -1, y: ev.deltaY * -1 },
		});
	};

	$canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
		dispatchToCanvas({
			type: 'set-screen-cursor',
			pos: { x, y },
		});
	});
	let mouseIsDown = false;
	window.addEventListener('mousemove', ({ movementX: x, movementY: y }) => {
		if (!mouseIsDown) {
			return;
		}
		dispatchToCanvas({
			type: 'pan-delta',
			pos: { x, y },
		});
	});
	$canvas.addEventListener('mousedown', () => {
		mouseIsDown = true;
	});
	window.addEventListener('mouseup', () => {
		mouseIsDown = false;
	});

	$canvas.addEventListener('mousedown', (ev) => {
		if (self.memory.id !== 'MAIN') {
			throw 'no';
		}
		if (!self.memory.lastKnownCanvasState) {
			throw 'no';
		}
		if (self.memory.lastKnownCanvasState.editMode === true) {
			if (
				!self.memory.lastKnownCanvasState.editModeTarget &&
				self.memory.lastKnownCanvasState.selected &&
				'roadEnd' in self.memory.lastKnownCanvasState.selected
			) {
				dispatchToCanvas({
					type: 'set-edit-mode-target',
					to: self.memory.lastKnownCanvasState?.selected,
				});
				return;
			}

			let { gameCursor, editModeTarget } = self.memory.lastKnownCanvasState;
			if (editModeTarget && 'roadEnd' in editModeTarget) {
				dispatchToCanvas({
					type: 'set-edit-mode-target',
					to: null,
				});
				mergeEntity<Road>(editModeTarget.entityId, {
					[editModeTarget.roadEnd]: gameCursor,
				});
			}
			return;
		}
		if (
			self.memory.lastKnownCanvasState.selected &&
			'entityId' in self.memory.lastKnownCanvasState.selected
		) {
			self.memory.ui?.pushRoute(ev, [
				'entity',
				{ entityId: self.memory.lastKnownCanvasState.selected.entityId },
			]);
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
			onReactStateUpdate_CANVAS(self.memory.lastKnownCanvasState);
		}
	}, worker);

	return onTick;
};

export default renderSetup;
