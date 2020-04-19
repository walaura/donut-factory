import { dispatchToCanvas } from '../../global/dispatch';
import { CanvasExceptionalMode } from '../../wk/canvas.defs';
import { addEntity, mergeEntity } from '../../game/entities';
import {
	Road,
	entityIsPreRoad,
	RoadEnd,
	entityIsRoad,
} from '../../entity/road';
import { addId } from '../../helper/generate';
import { requestWindow } from '../events';

export const register = ($canvas: HTMLCanvasElement) => {
	$canvas.addEventListener('wheel', (ev) => {
		ev.preventDefault();

		dispatchToCanvas({
			type: 'pan-delta',
			pos: { x: ev.deltaX * -1, y: ev.deltaY * -1 },
		});
	});
	$canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
		dispatchToCanvas({
			type: 'set-screen-cursor',
			pos: { x, y },
		});
	});

	let mouseIsDown = false;
	window.addEventListener('mousemove', ({ movementX: x, movementY: y }) => {
		if (!mouseIsDown) {
			return;
		}
		dispatchToCanvas({
			type: 'pan-delta',
			pos: { x, y },
		});
	});
	$canvas.addEventListener('mousedown', () => {
		mouseIsDown = true;
	});
	window.addEventListener('mouseup', () => {
		mouseIsDown = false;
	});
	$canvas.addEventListener('mousedown', (ev) => {
		if (self.memory.id !== 'MAIN') {
			throw 'no';
		}
		if (!self.memory.lastKnownCanvasState) {
			throw 'no';
		}

		let { gameCursor, editModeTarget } = self.memory.lastKnownCanvasState;

		if (
			self.memory.lastKnownCanvasState.mode === CanvasExceptionalMode.Add &&
			self.memory.lastKnownCanvasState.createModeTarget
		) {
			if (
				entityIsPreRoad(self.memory.lastKnownCanvasState.createModeTarget.ghost)
			) {
				dispatchToCanvas({
					type: 'set-create-mode-target',
					to: {
						ghost: {
							...self.memory.lastKnownCanvasState.createModeTarget.ghost,
							pre: undefined,
							start: {
								x: gameCursor.x,
								y: gameCursor.y,
							},
						},
						roadEnd: RoadEnd.end,
					},
				});
				return;
			}
			if (
				entityIsRoad(self.memory.lastKnownCanvasState.createModeTarget.ghost)
			) {
				dispatchToCanvas({
					type: 'set-mode',
					to: null,
				});
				addEntity({
					...self.memory.lastKnownCanvasState.createModeTarget.ghost,
					...addId(),
					end: {
						x: gameCursor.x,
						y: gameCursor.y,
					},
				});
				return;
			}
			if ('x' in self.memory.lastKnownCanvasState.createModeTarget.ghost) {
				dispatchToCanvas({
					type: 'set-mode',
					to: null,
				});
				addEntity({
					...self.memory.lastKnownCanvasState.createModeTarget.ghost,
					...addId(),
					x: gameCursor.x,
					y: gameCursor.y,
				});
			}
		}
		if (self.memory.lastKnownCanvasState.mode === CanvasExceptionalMode.Edit) {
			if (
				!self.memory.lastKnownCanvasState.editModeTarget &&
				self.memory.lastKnownCanvasState.selected &&
				'roadEnd' in self.memory.lastKnownCanvasState.selected
			) {
				dispatchToCanvas({
					type: 'set-edit-mode-target',
					to: self.memory.lastKnownCanvasState?.selected,
				});
				return;
			}

			if (editModeTarget && 'entityId' in editModeTarget) {
				dispatchToCanvas({
					type: 'set-mode',
					to: null,
				});
				if ('roadEnd' in editModeTarget) {
					mergeEntity<Road>(editModeTarget.entityId, {
						[editModeTarget.roadEnd]: gameCursor,
					});
					return;
				}
				mergeEntity(editModeTarget.entityId, {
					x: gameCursor.x,
					y: gameCursor.y,
				});
			}
			return;
		}
		if (
			self.memory.lastKnownCanvasState.selected &&
			'entityId' in self.memory.lastKnownCanvasState.selected
		) {
			self.memory.ui.boop();
			requestWindow(ev, [
				'entity',
				{ entityId: self.memory.lastKnownCanvasState.selected.entityId },
			]);
		}
	});
};
