import { h, render } from 'preact';
import 'preact/debug';
import 'preact/devtools';
import { getMemory } from '../global/memory';
import { getWorker } from '../global/worker';
import { GameState } from '../helper/defs';
import { LoopWorkerMessage, mkChannel, MsgActions } from '../global/message';
import { register } from './canvas/events';
import { onReactStateUpdate as onReactStateUpdate_CANVAS } from './hook/use-canvas-state';
import { onReactStateUpdate as onReactStateUpdate_GAME } from './hook/use-game-state';
//@ts-ignore
import lol from './sounds/click.wav';
import { diffState } from '../helper/diff';

var sound = document.createElement('audio');
sound.id = 'audio-player';
sound.src = lol;
document.body.append(sound);

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
	let hasSentInitialStateToCanvas = false;
	let rendered = false;
	let onTick = (state: GameState) => {
		let readyToRender = readyToRenderWithGame && readyToRenderWithCanvas;
		if (!rendered && readyToRender) {
			let channel = mkChannel('MAIN', 'CANVAS-WK');
			import('./react-root').then((root) => {
				requestAnimationFrame(() => {
					render(h(root.UI, {}), (window as any).overlays);
					rendered = true;
				});
			});
		}
		onReactStateUpdate_GAME(state);
		readyToRenderWithGame = true;
		if (readyToRenderWithCanvas) {
			let channel = mkChannel('MAIN', 'CANVAS-WK');
			channel.post({
				action: MsgActions.TOCK,
				state: !hasSentInitialStateToCanvas ? state : diffState({}, state),
			} as LoopWorkerMessage);
			hasSentInitialStateToCanvas = true;
		}
	};

	const pixelRatio = 1.5;
	const $canvas = (window as any).floor as HTMLCanvasElement;
	$canvas.width = window.innerWidth * pixelRatio;
	$canvas.height = window.innerHeight * pixelRatio;
	$canvas.style.width = window.innerWidth + 'px';
	$canvas.style.height = window.innerHeight + 'px';

	self.memory.ui.boop = () => {
		sound.volume = 0.3 + Math.random() * 0.2;
		sound.play();
	};
	register($canvas);

	canvasSetup().then(() => {
		let offscreenCanvas: HTMLCanvasElement | OffscreenCanvas = $canvas;
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
				//@ts-ignore
				[offscreenCanvas]
			);
	});
	return onTick;
};

export default renderSetup;
