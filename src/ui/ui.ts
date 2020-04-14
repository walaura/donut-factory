import { addEntity } from './../game/entities';
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
//@ts-ignore
import lol from './sounds/click.wav';
import { CanvasExceptionalMode } from '../wk/canvas.defs';
import { renderCanvasLayers } from '../canvas/canvas';
let worker;

var sound = document.createElement('audio');
sound.id = 'audio-player';
sound.src = lol;
document.body.append(sound);
const renderSetup = () => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}

	let readyToRenderWithGame = false;
	let readyToRenderWithCanvas = false;
	let rendered = false;

	let onTick = (state: GameState) => {
		let readyToRender = readyToRenderWithGame && readyToRenderWithCanvas;
		if (!rendered && readyToRender) {
			requestAnimationFrame(() => {
				render(h(UI, {}), (window as any).overlays);
				rendered = true;
			});
		}
		onReactStateUpdate_GAME(state);
		readyToRenderWithGame = true;
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
		let handle = renderCanvasLayers($canvas, {
			width: $canvas.width / pixelRatio,
			height: $canvas.height / pixelRatio,
		});
		let frame = handle.onFrame({
			state: self.memory.lastKnownGameState,
			prevState: self.memory.lastKnownGameState;
			rendererState: {		selected: { xy: { x: 0, y: 0 } },
			viewport: { x: 0, y: 0 },
			zoom: 20,
			gameCursor: { x: 0, y: 0 },
			screenCursor: { x: 0, y: 0 },
			followTarget: null,
			editModeTarget: null,
			createModeTarget: null,
			mode: null,
			debugMode: false,
		}
		});
		self.memory.lastKnownCanvasState = frame;
		readyToRenderWithCanvas = true;
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

	self.memory.ui.boop = () => {
		sound.volume = 0.3 + Math.random() * 0.2;
		sound.play();
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

		let { gameCursor, editModeTarget } = self.memory.lastKnownCanvasState;

		if (self.memory.lastKnownCanvasState.mode === CanvasExceptionalMode.Add) {
			if (
				self.memory.lastKnownCanvasState.createModeTarget &&
				'x' in self.memory.lastKnownCanvasState.createModeTarget.ghost
			) {
				dispatchToCanvas({
					type: 'set-mode',
					to: null,
				});
				addEntity({
					...self.memory.lastKnownCanvasState.createModeTarget.ghost,
					x: gameCursor.x,
					y: gameCursor.y,
				});
			}
		}
		if (self.memory.lastKnownCanvasState.mode === CanvasExceptionalMode.Edit) {
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

			if (editModeTarget && 'entityId' in editModeTarget) {
				dispatchToCanvas({
					type: 'set-mode',
					to: null,
				});
				if ('roadEnd' in editModeTarget) {
					mergeEntity<Road>(editModeTarget.entityId, {
						[editModeTarget.roadEnd]: gameCursor,
					});
					return;
				}
				mergeEntity(editModeTarget.entityId, {
					x: gameCursor.x,
					y: gameCursor.y,
				});
			}
			return;
		}
		if (
			self.memory.lastKnownCanvasState.selected &&
			'entityId' in self.memory.lastKnownCanvasState.selected
		) {
			self.memory.ui.boop();
			self.memory.ui.pushRoute(ev, [
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
			readyToRenderWithCanvas = true;
		}
	}, worker);

	return onTick;
};

export default renderSetup
