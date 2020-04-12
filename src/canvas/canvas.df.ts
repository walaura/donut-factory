import type { GameState } from '../helper/defs';
import type { CanvasRendererState } from '../wk/canvas.defs';

export type OnFrameProps = {
	state: GameState;
	prevState: GameState;
	rendererState: CanvasRendererState;
};

export type ExternalOnFrame = (p: OnFrameProps) => CanvasRendererState;
export type InternalOnFrame = (p: OnFrameProps) => OffscreenCanvas;

export type OffscreenCanvasRenderer = (
	p: OffScreenCanvasProps
) => InternalOnFrame;

export type OffScreenCanvasProps = {
	width: number;
	height: number;
};
