import { renderLayersToCanvas } from '../canvas/canvas';
import { getMemory } from '../global/memory';
import { LastKnownGameState } from '../helper/defs';
import { CanvasRendererState } from './canvas.defs';

export const registerCanvasClock = (
	...args: Parameters<typeof renderLayersToCanvas>
) => {
	renderLayersToCanvas;
	return null;
};
