import { h, render } from 'preact';
import 'preact/debug';
import 'preact/devtools';
import { Road } from '../entity/road';
import { mergeEntity } from '../game/entities';
import { getMemory } from '../global/memory';
import { getWorker } from '../global/worker';
import { GameState } from '../helper/defs';
import { LoopWorkerMessage, mkChannel, MsgActions } from '../helper/message';
import { registerCanvasClock } from '../wk/canvas.clock';
import { CanvasExceptionalMode } from '../wk/canvas.defs';
import { addEntity } from './../game/entities';
import { dispatchToCanvas } from './../global/dispatch';
import { onReactStateUpdate as onReactStateUpdate_CANVAS } from './hook/use-canvas-state';
import { onReactStateUpdate as onReactStateUpdate_GAME } from './hook/use-game-state';
import { UI } from './react-root';
//@ts-ignore
import lol from './sounds/click.wav';

var sound = document.createElement('audio');
sound.id = 'audio-player';
sound.src = lol;
document.body.append(sound);

const setupCanvas = ($canvas, width, height, pixelRatio) => {
	let clock = registerCanvasClock($canvas, {
		width: $canvas.width / pixelRatio,
		height: $canvas.height / pixelRatio,
	});
	clock;
};

const canvasSetup = () => {
	if (!('OffscreenCanvas' in self)) {
		let mm = getMemory('MAIN');
		mm.memory.simulatedWorkers['CANVAS-WK'] = {};
		return import('./../wk/canvas.wk').then((pack) => {
			pack.register();
		});
	} else {
		getWorker('CANVAS-WK');
		return Promise.resolve();
	}
};

const renderSetup = () => {
	if (self.memory.id !== 'MAIN') {
		throw 'no';
	}

	let readyToRenderWithGame = false;
	let readyToRenderWithCanvas = false;
	let rendered = false;
	let loadedFallbackCanvas = false;
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
		if (readyToRenderWithCanvas) {
			let channel = mkChannel('MAIN', 'CANVAS-WK');
			channel.post({ action: 'TOCK', state } as LoopWorkerMessage);
		}
	};

	const pixelRatio = 1.5;
	const $canvas = (window as any).floor as HTMLCanvasElement;
	$canvas.width = window.innerWidth * pixelRatio;
	$canvas.height = window.innerHeight * pixelRatio;
	$canvas.style.width = window.innerWidth + 'px';
	$canvas.style.height = window.innerHeight + 'px';

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

	canvasSetup().then(() => {
		let offscreenCanvas = $canvas;
		if ('transferControlToOffscreen' in $canvas) {
			offscreenCanvas = $canvas.transferControlToOffscreen();
		}

		let channel = mkChannel('MAIN', 'CANVAS-WK');
		channel.listen((msg) => {
			let mm = getMemory('MAIN');
			if (msg.action === MsgActions.CANVAS_RESPONSE) {
				if (mm.memory.id !== 'MAIN') {
					throw 'no';
				}
				mm.memory.lastKnownCanvasState = msg.rendererState;
				onReactStateUpdate_CANVAS(msg.rendererState);
				readyToRenderWithCanvas = true;
			}
		});
		channel.transfer &&
			channel.transfer(
				{
					action: MsgActions.SEND_CANVAS,
					canvas: offscreenCanvas,
					pixelRatio,
				},
				[offscreenCanvas]
			);
	});
	return onTick;
};

export default renderSetup;
