import { Target, getDistanceToPoint } from '../../helper/pathfinding';
import { GameState } from './../../helper/defs';
import { XY, scale as mkScale } from '../../helper/xy';
import { bgLayerRenderer } from '../layer/bg';
import { entityLayerRenderer } from '../layer/entities';
import { roadLayerRenderer } from '../layer/road';

export type OnFrame = (
	gameState: GameState,
	bag: { rendererState: RendererState; previousGameState: GameState }
) => { canvas: OffscreenCanvas };

export type Renderer = {
	onFrame: OnFrame;
};

export type RendererState = {
	selected: Target;
};

export type OffScreenCanvasProps = {
	width: number;
	height: number;
	zoom: number;
};

export const renderCanvasLayers = (
	canvas: OffscreenCanvas,
	{ width, height, zoom }: OffScreenCanvasProps
): {
	onFrame: (
		previousGameState: GameState,
		state: GameState
	) => { canvas: OffscreenCanvas; rendererState: RendererState };
	setCursor: (xy: XY) => void;
} => {
	let cursor: XY = { x: 20, y: 40 };

	const bgRenderer = bgLayerRenderer({ width, height, zoom });
	const entityRenderer = entityLayerRenderer({ width, height, zoom });
	const roadRenderer = roadLayerRenderer({ width, height, zoom });

	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const scale = (xy: XY) => mkScale(xy, zoom);

	const setCursor = (newCursor: XY) => {
		cursor = newCursor;
	};

	const onFrame = (previousGameState: GameState, state: GameState) => {
		const rendererState: RendererState = {
			selected: { xy: cursor },
		};

		for (let agent of Object.values(state.entities)) {
			if (!('x' in agent)) {
				continue;
			}
			if ('entityId' in rendererState.selected) {
				break;
			}
			let scaled = scale(agent);
			let distance = getDistanceToPoint(cursor, scaled) / zoom;
			if (distance < 4) {
				rendererState.selected = {
					entityId: agent.id,
				};
			}
		}

		// clear all
		ctx.clearRect(0, 0, width, height);

		const renderLayer = (onFrame: OnFrame) => {
			ctx.drawImage(
				onFrame(state, {
					previousGameState,
					rendererState,
				}).canvas,
				0,
				0
			);
		};
		renderLayer(bgRenderer.onFrame);
		renderLayer(roadRenderer.onFrame);
		renderLayer(entityRenderer.onFrame);

		return { canvas, rendererState };
	};

	return { onFrame, setCursor };
};
