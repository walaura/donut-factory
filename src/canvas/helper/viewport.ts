import { CanvasRendererStateViewport } from '../../wk/canvas.defs';

export const getCanvasViewportState = (): CanvasRendererStateViewport => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}
	if (!self.memory.state) {
		throw 'no';
	}
	if (!('zoom' in self.memory.state)) {
		throw 'no';
	}
	let { viewport, zoom } = self.memory.state;
	return { viewport, zoom };
};
