import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { getMemory } from '../global/memory';
import { getWorker } from '../global/worker';
import { mkChannel, MsgActions } from '../helper/message';
import { onReactStateUpdate as onReactStateUpdate_CANVAS } from './hook/use-canvas-state';

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

const wireCanvas = ($canvas: HTMLCanvasElement) => {
	const pixelRatio = 1.5;
	$canvas.width = window.innerWidth * pixelRatio;
	$canvas.height = window.innerHeight * pixelRatio;
	$canvas.style.width = window.innerWidth + 'px';
	$canvas.style.height = window.innerHeight + 'px';

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
};

export const Canvas = () => {
	let canvasRef = useRef<HTMLCanvasElement>();
	useEffect(() => {
		if (canvasRef.current) {
			wireCanvas(canvasRef.current);
		}
	}, [canvasRef]);
	return <canvas ref={canvasRef} />;
};
