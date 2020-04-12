import { scale as mkScale, XY } from '../../helper/xy';
import {
	CanvasRendererState,
	CanvasRendererStateViewport,
} from '../../wk/canvas.defs';

export const mkWorldToScreen = (rendererState: CanvasRendererStateViewport) => {
	const { zoom, viewport } = rendererState;
	const translate = (xy: XY) => ({
		x: xy.x + viewport.x,
		y: xy.y + viewport.y,
	});
	const scale = (xy: XY) => mkScale(xy, zoom);

	return (xy: XY) => translate(scale(xy));
};
export const mkScreenToWorld = (rendererState: CanvasRendererStateViewport) => {
	const { zoom, viewport } = rendererState;
	const translate = (xy: XY) => ({
		x: xy.x - viewport.x,
		y: xy.y - viewport.y,
	});
	const scale = (xy: XY) => ({
		x: xy.x / zoom,
		y: xy.y / zoom,
	});
	const round = (xy: XY) => ({
		x: Math.round(xy.x),
		y: Math.round(xy.y),
	});

	return (xy: XY) => round(scale(translate(xy)));
};
