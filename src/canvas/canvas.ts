import { RoadEnd } from '../entity/road';
import { findEntity } from '../game/entities';
import { EntityType } from '../helper/defs';
import {
	addSpeedToMovement,
	applyMovement,
	chase,
	isAtPos,
	chaseLinear,
} from '../helper/movement';
import { getDistanceToPoint } from '../helper/pathfinding';
import { StatefulTarget } from '../helper/target';
import { xy } from '../helper/xy';
import { commitActions } from '../wk/canvas.actions';
import { entityIsRoad } from './../entity/road';
import {
	ExternalOnFrame,
	OffScreenCanvasProps,
	OffscreenCanvasRenderer,
	OnFrameProps,
} from './canvas.df';
import { viewportToWorld, worldToViewport, worldToAbs } from './helper/latlong';
import { bgLayerRenderer } from './layer/bg';
import { entityLayerRenderer } from './layer/entities';
import { roadLayerRenderer } from './layer/road';
import { CanvasExceptionalMode } from '../wk/canvas.defs';

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
						score: rendererState.mode === CanvasExceptionalMode.Edit ? 2 : 0.1,
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

export const renderLayersToCanvas = (
	canvas: OffscreenCanvas,
	{ width, height }: OffScreenCanvasProps
): {
	onFrame: ExternalOnFrame;
} => {
	const bgRenderer = bgLayerRenderer({ width, height });
	const entityRenderer = entityLayerRenderer({ width, height });
	const roadRenderer = roadLayerRenderer({ width, height });

	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const onFrame: ExternalOnFrame = ({ state, prevState, rendererState }) => {
		rendererState = commitActions(rendererState);

		rendererState.gameCursor = viewportToWorld(rendererState.screenCursor);
		rendererState.selected = findSelected({ state, rendererState });
		const { gameCursor, zoom, followTarget, selected } = rendererState;

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
			const { x, y } = worldToViewport(gameCursor);
			ctx.rect(x, y, zoom, zoom);
			ctx.globalAlpha = 0.25;
			ctx.stroke();
			ctx.globalAlpha = 1;
		}

		// follow mode?
		if (followTarget && 'entityId' in followTarget) {
			let followable = findEntity(followTarget.entityId, state);
			if (followable && 'x' in followable) {
				let cursedViewportInGame = viewportToWorld(xy([width / 2, height / 2]));
				if (!isAtPos(cursedViewportInGame, followable)) {
					const movement = addSpeedToMovement(
						chase(cursedViewportInGame, followable),
						-1
					);
					rendererState.viewport = applyMovement(
						rendererState.viewport,
						movement
					);
				}
			}
		}

		return rendererState;
	};

	return { onFrame };
};
