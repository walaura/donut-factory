import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { getMemory } from '../../global/memory';

export const getCanvasViewportState = (): CanvasRendererStateViewport => {
	let mm = getMemory('CANVAS-WK');

	if (!mm.memory.state) {
		throw 'no';
	}
	if (!('zoom' in mm.memory.state)) {
		throw 'no';
	}
	let { viewport, zoom } = mm.memory.state;
	return { viewport, zoom };
};
