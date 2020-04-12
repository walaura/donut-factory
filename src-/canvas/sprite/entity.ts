import { Entity, WithXY } from '../../helper/defs';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';

//todo: unify w/ sprites
const mkAgents = () => {
	let canvases: { [key in string]: OffscreenCanvas } = {};

	const mkAgent = (
		agent: Entity & WithXY,
		{ size = 50, scale = 1, flip = false } = {}
	) => {
		if (!canvases[agent.id]) {
			canvases[agent.id] = makeCanvasOrOnScreenCanvas(size, size);
		}
		const ctx = canvases[agent.id].getContext(
			'2d'
		) as OffscreenCanvasRenderingContext2D;
		ctx.clearRect(0, 0, size, size);
		if (flip) {
			ctx.translate(size, 0);
			ctx.scale(-1, 1);
		}

		if ('color' in agent) {
			ctx.filter = `hue-rotate(${agent.color}deg)`;
		}
		ctx.font = size * 0.66 + 'px Arial';
		ctx.fillText(agent.emoji, size * 0.17, size * 0.75);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		if (scale) {
			ctx.translate(size / 2, size);
			ctx.scale(1 + scale / 2.5, 1 + scale / 2.5);
			ctx.translate(size / -2, size / -1);
		}

		return canvases[agent.id];
	};

	return { mkAgent };
};

export { mkAgents };
