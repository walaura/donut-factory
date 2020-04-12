import { entityIsRoad } from './../entity/road';
import { RoadEnd } from '../entity/road';
import { GameState, Entity, EntityType } from '../helper/defs';
import { getDistanceToPoint } from '../helper/pathfinding';
import { XY } from '../helper/xy';
import { commitActions } from '../wk/canvas.actions';
import { CanvasRendererState } from '../wk/canvas.defs';
import {
	OffScreenCanvasProps,
	OffscreenCanvasRenderer,
	ExternalOnFrame,
	OnFrameProps,
} from './canvas.df';
import { bgLayerRenderer } from './layer/bg';
import { entityLayerRenderer } from './layer/entities';
import { roadLayerRenderer } from './layer/road';
import { Target, StatefulTarget } from '../helper/target';
import { mkScreenToWorld, mkWorldToScreen } from './helper/latlong';

const initialState: CanvasRendererState = {
	selected: { xy: { x: 0, y: 0 } },
	viewport: { x: 0, y: 0 },
	zoom: 20,
	gameCursor: { x: 0, y: 0 },
	screenCursor: { x: 0, y: 0 },
	editMode: false,
	editModeTarget: null,
};

const findSelected = ({
	state,
	rendererState,
}: Pick<OnFrameProps, 'state' | 'rendererState'>) => {
	const { gameCursor, zoom } = rendererState;
	const distanceThreshold = 0.25;
	let potentiallySelected: StatefulTarget[] = [];
	for (let entity of Object.values(state.entities)) {
		if (!('x' in entity) && !entityIsRoad(entity)) {
			continue;
		}
		if (entityIsRoad(entity)) {
			[RoadEnd.end, RoadEnd.start].forEach((roadEnd) => {
				let distance = getDistanceToPoint(gameCursor, entity[roadEnd]) / zoom;
				if (distance < distanceThreshold) {
					potentiallySelected.push({
						entityId: entity.id,
						roadEnd,
						score: 0.1,
					});
				}
			});
			continue;
		}
		let distance = getDistanceToPoint(gameCursor, entity) / zoom;
		if (distance < distanceThreshold) {
			potentiallySelected.push({
				entityId: entity.id,
				score: entity.type === EntityType.Vehicle ? 1 : 0.5,
			});
		}
	}
	let result = potentiallySelected.sort((a, b) => b.score - a.score).shift();
	if (!result) {
		return { xy: gameCursor };
	}
	return result;
};

const translateScreenCursorToGameCursor = ({
	zoom,
	screenCursor: { x, y },
}: {
	zoom: number;
	screenCursor: XY;
}) => ({
	x: Math.round((x - zoom / 2) / zoom),
	y: Math.round((y - zoom / 2) / zoom),
});

export const renderCanvasLayers = (
	canvas: OffscreenCanvas,
	{ width, height }: OffScreenCanvasProps
): {
	rendererState: CanvasRendererState;
	onFrame: ExternalOnFrame;
} => {
	const bgRenderer = bgLayerRenderer({ width, height });
	const entityRenderer = entityLayerRenderer({ width, height });
	const roadRenderer = roadLayerRenderer({ width, height });

	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const onFrame: ExternalOnFrame = ({ state, prevState, rendererState }) => {
		rendererState = commitActions(rendererState);

		let viewportToGameWorld = mkScreenToWorld(rendererState);
		let world2screen = mkWorldToScreen(rendererState);

		rendererState.gameCursor = viewportToGameWorld(rendererState.screenCursor);
		rendererState.selected = findSelected({ state, rendererState });
		const { gameCursor, zoom, selected } = rendererState;

		// clear all
		ctx.clearRect(0, 0, width, height);
		const renderLayer = (onFrame: ReturnType<OffscreenCanvasRenderer>) => {
			ctx.drawImage(
				onFrame({
					state,
					prevState,
					rendererState,
				}),
				0,
				0
			);
		};
		[bgRenderer, roadRenderer, entityRenderer].map(renderLayer);

		// draw cursor
		if (!('entityId' in selected)) {
			ctx.beginPath();
			const { x, y } = world2screen(gameCursor);
			ctx.rect(x, y, zoom, zoom);
			ctx.globalAlpha = 0.25;
			ctx.stroke();
			ctx.globalAlpha = 1;
		}
		return rendererState;
	};

	return { onFrame, rendererState: initialState };
};
