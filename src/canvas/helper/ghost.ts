import { GhostTarget } from '../../helper/target';
import { CanvasExceptionalMode } from '../../wk/canvas.defs';
import { findEntity } from '../../game/entities';
import { Road } from '../../entity/road';

export const getGhostTargetIfAny = (): GhostTarget | null => {
	if (self.memory.id !== 'CANVAS-WK') {
		throw 'no';
	}
	if (!self.memory.state) {
		throw 'no';
	}
	let rendererState = self.memory.state;
	let gameState = self.memory.lastKnownGameState;
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
