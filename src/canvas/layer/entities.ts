import { entityIsRoad, entityIsPreRoad } from '../../entity/road';
import { findEntity } from '../../game/entities';
import { EntityType, WithCargo, WithID } from '../../helper/defs';
import { appendWithId } from '../../helper/generate';
import { XY, xyMap } from '../../helper/xy';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { mkAnimations } from '../helper/animation';
import { getGhostTargetIfAny } from '../helper/ghost';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkChip } from '../sprite/chip';
import { mkAgents } from '../sprite/entity';
import { numberAsCurrency } from './../../ui/helper/format';
import { worldToViewport } from './../helper/latlong';
import { height as chipH, width as chipW } from './../sprite/chip';
import { drawScaled } from './../sprite/scaler';
import { lerp } from '../../helper/math';

interface Feedback extends WithID {
	text: string;
	xy: XY;
}

const entityLayerRenderer: OffscreenCanvasRenderer = ({ width, height }) => {
	let feedback: { [key in string]: Feedback } = {};
	let mkAgent = mkAgents().mkAgent;

	const canvas = makeCanvasOrOnScreenCanvas(width, height);
	const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

	const { animationTick, useBouncyValue, useAnimatedValue } = mkAnimations();

	return ({ state, prevState, rendererState }) => {
		const { selected, zoom } = rendererState;
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'black';

		animationTick();

		let dragging = getGhostTargetIfAny();
		let drawables = Object.values(state.entities);

		/*
		edit mode?
		*/
		if (dragging) {
			drawables.push({ ...dragging.ghost, ...rendererState.gameCursor });
		}
		for (let entity of drawables) {
			if (entityIsRoad(entity) || entityIsPreRoad(entity)) {
				continue;
			}

			if (!('x' in entity)) {
				continue;
			}

			const pixelRatio = 1.5;

			let fontSize = useBouncyValue('ag:' + entity.id);
			let flipper = useBouncyValue('ag:flip:' + entity.id);
			let agentSize = zoom * 2.5 * pixelRatio;
			if ('entityId' in selected && selected.entityId === entity.id) {
				fontSize.up();
			}
			let { x, y } = worldToViewport(entity);
			let prevAgent = prevState.entities[entity.id];
			if (entity.type === EntityType.Vehicle && prevAgent && 'x' in prevAgent) {
				if (entity.x > prevAgent.x) {
					flipper.up(0.5);
				}
			}
			if (dragging && dragging.ghost.id === entity.id) {
				ctx.globalAlpha = 0.25;
			}
			ctx.drawImage(
				mkAgent(entity, {
					size: agentSize,
					flip: flipper.value > 0,
					scale: lerp(0, 0.5, fontSize.value),
				}),
				x - (agentSize / pixelRatio - zoom) / 2,
				y - (agentSize / pixelRatio - zoom) / 1,
				agentSize / pixelRatio,
				agentSize / pixelRatio
			);
			ctx.globalAlpha = 1;
		}

		// have they created shit this frame
		try {
			for (let entity of Object.values(state.entities)) {
				if ('cargo' in entity && 'produces' in entity) {
					for (let cargo of Object.values(entity.cargo)) {
						if (!entity.produces.includes(cargo.productId)) {
							continue;
						}
						let previousCargo = (prevState.entities[entity.id] as WithCargo)
							.cargo[cargo.productId];
						if (
							Math.floor(cargo.quantity) > Math.floor(previousCargo.quantity)
						) {
							feedback = appendWithId(feedback, {
								xy: entity,
								text: findEntity(cargo.productId, state)?.emoji ?? '$$',
							});
						}
					}
				}
			}
		} catch (e) {
			console.error('how to handle this');
		}

		// pop cool text
		let lastUpdate = state.ledger[state.ledger.length - 1];
		if (
			prevState.ledger.length !== state.ledger.length &&
			lastUpdate.relevantAgents
		) {
			const xy = findEntity(lastUpdate.relevantAgents[0], state);
			if (xy) {
				feedback = appendWithId(feedback, {
					xy,
					text: numberAsCurrency(state.ledger[state.ledger.length - 1].tx),
				});
			}
		}

		// overlays
		for (let toast of Object.values(feedback)) {
			const yDelta = useAnimatedValue('toast:' + toast.id, [
				{
					to: 1,
					strength: 0.01,
				},
			]);
			const origin = worldToViewport({
				x: toast.xy.x + Math.cos(lerp(0, Math.PI * 5, yDelta.value)) / 7.5,
				y: toast.xy.y + lerp(0, -10, yDelta.value),
			});
			if (yDelta.value >= 1) {
				delete feedback[toast.id];
				yDelta.discard();
			}
			let textBoxPosi = {
				x: origin.x - 100,
				y: origin.y,
			};
			ctx.globalAlpha = lerp(1, 0, yDelta.value);
			drawScaled(
				ctx,
				mkChip({
					text: `${toast.text}`,
					style: toast.text.length <= 2 ? 'transparent' : 'normal',
				}),
				{
					width: chipW,
					height: chipH,
					offset: 10,
					scale: lerp(1, 2, yDelta.value),
				},
				xyMap(textBoxPosi, (val, k) => val[k] - 10)
			);
			ctx.globalAlpha = 1;
		}

		return canvas;
	};
};

export { entityLayerRenderer };
