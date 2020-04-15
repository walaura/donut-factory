import { renderLayersToCanvas } from '../canvas/canvas';
import { getMemory } from '../global/memory';
import { LastKnownGameState } from '../helper/defs';
import { CanvasRendererState } from './canvas.defs';

// onTick => AfterTick
type Clock<Props, TickProps> = (...Props) => (TickProps) => () => void;

export const registerCanvasClock: Clock<
	Parameters<typeof renderLayersToCanvas>,
	LastKnownGameState
> = (...args: Parameters<typeof renderLayersToCanvas>) => {
	let clock = renderLayersToCanvas(...args);
	let onTick = (state: LastKnownGameState) => {
		let mm = getMemory('CANVAS-WK');
		mm.memory.lastKnownGameState = state;
		mm.memory.state = clock.onFrame({
			state: mm.memory.lastKnownGameState,
			prevState: mm.memory.prevKnownGameState ?? mm.memory.lastKnownGameState,
			rendererState: mm.memory.state as CanvasRendererState,
		});

		let afterTick = () => {
			mm.memory.prevKnownGameState = mm.memory.lastKnownGameState;
		};
		return afterTick;
	};
	return onTick;
};
