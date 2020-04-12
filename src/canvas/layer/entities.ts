import { worldToViewport } from './../helper/latlong';
import { entityIsRoad } from '../../entity/road';
import { findEntity } from '../../game/entities';
import { EntityType, WithID, WithCargo } from '../../helper/defs';
import { appendWithId } from '../../helper/generate';
import { scale as mkScale, XY, xy2arr } from '../../helper/xy';
import { OffscreenCanvasRenderer } from '../canvas.df';
import { mkAnimations } from '../helper/animation';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { mkAgents } from '../sprite/entity';
import { CanvasRendererState } from '../../wk/canvas.defs';

const lerp = (start, end, t) => {
	return start * (1 - t) + end * t;
};

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
		//agents
		for (let entity of Object.values(state.entities)) {
			if (entityIsRoad(entity)) {
				continue;
			}

			if (!('x' in entity)) {
				continue;
			}

			const pixelRatio = 1.5;

			let fontSize = useBouncyValue({ value: 0 }, 'ag:' + entity.id);
			let agentSize = zoom * 2.5 * pixelRatio;
			if ('entityId' in selected && selected.entityId === entity.id) {
				fontSize.up();
			}
			let { x, y } = worldToViewport(entity);
			let flip = false;
			let prevAgent = prevState.entities[entity.id];
			if (entity.type === EntityType.Vehicle && prevAgent && 'x' in prevAgent) {
				if (entity.x - prevAgent.x >= -0.01) {
					flip = true;
				}
			}
			ctx.drawImage(
				mkAgent(entity, {
					size: agentSize,
					flip,
					scale: lerp(0, 0.5, fontSize.value),
				}),
				x - (agentSize / pixelRatio - zoom) / 2,
				y - (agentSize / pixelRatio - zoom) / 1,
				agentSize / pixelRatio,
				agentSize / pixelRatio
			);
		}

		// have they created shit this frame
		for (let entity of Object.values(state.entities)) {
			if ('cargo' in entity && 'produces' in entity) {
				for (let cargo of Object.values(entity.cargo)) {
					if (!entity.produces.includes(cargo.productId)) {
						continue;
					}
					let previousCargo = (prevState.entities[entity.id] as WithCargo)
						.cargo[cargo.productId];
					if (Math.floor(cargo.quantity) > Math.floor(previousCargo.quantity)) {
						feedback = appendWithId(feedback, {
							xy: entity,
							text: findEntity(cargo.productId, state)?.name ?? '$$',
						});
					}
				}
			}
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
					text: state.ledger[state.ledger.length - 1].tx,
				});
			}
		}

		// overlays
		for (let toast of Object.values(feedback)) {
			const yDelta = useAnimatedValue(
				{
					value: 0,
					speed: 100,
				},
				'toast:' + toast.id
			);
			const origin = worldToViewport({
				x: toast.xy.x + Math.cos(lerp(0, Math.PI * 5, yDelta.value)) / 7.5,
				y: toast.xy.y + lerp(0, -10, yDelta.value),
			});
			if (yDelta.value < yDelta.max) {
				yDelta.up();
			} else {
				delete feedback[toast.id];
				yDelta.discard();
			}
			ctx.font = '16px sans-serif';
			ctx.globalAlpha = lerp(2, 0, yDelta.value);
			let metrics = ctx.measureText(`${toast.text}`.toUpperCase());
			let padding = 6;
			let textBoxPosi = {
				x: origin.x - padding,
				y: origin.y - metrics.emHeightAscent - padding,
			};
			let textBoxDimensions = {
				x: metrics.width + padding * 2,
				y: metrics.emHeightAscent + padding * 2,
			};

			ctx.fillStyle = '#13B477';
			ctx.fillRect(
				textBoxPosi.x,
				textBoxPosi.y,
				textBoxDimensions.x,
				textBoxDimensions.y
			);
			ctx.beginPath();
			ctx.arc(
				textBoxPosi.x,
				textBoxPosi.y + textBoxDimensions.y / 2,
				textBoxDimensions.y / 2,
				0,
				2 * Math.PI
			);
			ctx.arc(
				textBoxPosi.x + textBoxDimensions.x,
				textBoxPosi.y + textBoxDimensions.y / 2,
				textBoxDimensions.y / 2,
				0,
				2 * Math.PI
			);
			ctx.fill();
			ctx.fillStyle = '#fff';
			ctx.fillText(`${toast.text}`.toUpperCase(), ...xy2arr(origin));
			ctx.globalAlpha = 1;
		}

		return canvas;
	};
};

export { entityLayerRenderer };
