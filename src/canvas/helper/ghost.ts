import { GhostTarget } from '../../helper/target';
import { CanvasExceptionalMode } from '../../wk/canvas.defs';
import { findEntity } from '../../game/entities';
import { Road } from '../../entity/road';
import { getMemory } from '../../global/memory';

export const getGhostTargetIfAny = (): GhostTarget | null => {
	let mm = getMemory('CANVAS-WK');
	if (!mm.memory.state) {
		throw 'no';
	}
	let rendererState = mm.memory.state;
	let gameState = mm.memory.lastKnownGameState;
	if (!gameState) {
		return null;
	}
	if (!rendererState.mode) {
		return null;
	}

	if (rendererState.createModeTarget) {
		return rendererState.createModeTarget;
	}
	if (
		rendererState.editModeTarget &&
		'entityId' in rendererState.editModeTarget
	) {
		return {
			...rendererState.editModeTarget,
			ghost: findEntity(
				rendererState.editModeTarget.entityId,
				gameState
			) as Road,
		};
	}
	return null;
};
