import { entityIsRoad, RoadEnd } from '../entity/road';
import { getDistanceToPoint } from '../helper/pathfinding';
import { Target } from '../helper/target';
import { GameState } from '../helper/defs';
import { XY, scale as mkScale } from '../helper/xy';
import { bgLayerRenderer } from './layer/bg';
import { entityLayerRenderer } from './layer/entities';
import { roadLayerRenderer } from './layer/road';
import { commitActions } from '../wk/canvas.actions';
import { CanvasRendererState } from '../wk/canvas.defs';

export type OnFrame = (
	gameState: GameState,
	bag: { rendererState: CanvasRendererState; previousGameState: GameState }
) => { canvas: OffscreenCanvas };

export type Renderer = {
	onFrame: OnFrame;
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
	rendererState: CanvasRendererState;
	onFrame: (
		previousGameState: GameState,
		state: GameState,
		rendererState: CanvasRendererState
	) => { canvas: OffscreenCanvas; rendererState: CanvasRendererState };
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

	const onFrame = (
		previousGameState: GameState,
		state: GameState,
		rendererState: CanvasRendererState
	) => {
		rendererState.gameCursor = {
			x: Math.round((cursor.x - zoom / 2) / zoom),
			y: Math.round((cursor.y - zoom / 2) / zoom),
		};
		rendererState.selected = { xy: rendererState.gameCursor };

		for (let agent of Object.values(state.entities)) {
			if (RoadEnd.end in agent) {
				[RoadEnd.end, RoadEnd.start].forEach((rdEnd) => {
					let scaled = scale(agent[rdEnd]);
					let distance = getDistanceToPoint(cursor, scaled) / zoom;
					if (distance < 4) {
						rendererState.selected = {
							entityId: agent.id,
							roadEnd: rdEnd,
						};
					}
				});
			}
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

		// cursor
		if (!('entityId' in rendererState.selected)) {
			ctx.beginPath();
			const { x, y } = rendererState.gameCursor;
			ctx.rect(x * zoom, y * zoom, zoom, zoom);
			ctx.globalAlpha = 0.25;
			ctx.stroke();
			ctx.globalAlpha = 1;
		}
		rendererState = commitActions(rendererState);

		return { canvas, rendererState };
	};

	let rendererState: CanvasRendererState = {
		selected: { xy: cursor },
		zoom,
		gameCursor: cursor,
		cursor,
		editMode: false,
	};
	return { onFrame, setCursor, rendererState };
};
