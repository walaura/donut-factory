import { WithID, ID } from '../../helper/defs';
import { clamp } from '../../helper/math';

const ease = (t) =>
	t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

interface Force {
	to: number;
	strength: number;
}
interface Animation extends WithID {
	_value: number;
	frameForces: Force[];
	constantForces: Force[];
}

interface AnimatedValue {
	addForce: (to: Force['to'], strength: Force['strength']) => void;
	up: (scale?: number) => void;
	discard: () => void;
	value: number;
}

export const mkAnimations = () => {
	let animations: { [key in string]: Animation } = {};

	const useBaseAnimatedValue = (
		animation: Omit<Animation, 'id' | '_value' | 'frameForces'>,
		id: ID
	): AnimatedValue => {
		if (!animations[id]) {
			animations[id] = {
				id,
				_value: 0,
				frameForces: [],
				...animation,
			};
		}
		const addForce = (to, strength) => {
			animations[id].frameForces.push({ to, strength });
		};
		return {
			value: ease(animations[id]._value),
			addForce,
			up: (scale = 0.1) => {
				addForce(1, scale);
			},
			discard: () => {
				delete animations[id];
			},
		};
	};

	const useAnimatedValue = (id: ID, constantForces: Force[] = []) =>
		useBaseAnimatedValue({ constantForces }, id);

	const useBouncyValue = (id: ID) =>
		useBaseAnimatedValue(
			{
				constantForces: [{ to: 0, strength: 0.025 }],
			},
			id
		);

	const animationTick = () => {
		for (let number of Object.values(animations)) {
			let forces = [...number.constantForces, ...number.frameForces];

			for (let force of forces) {
				let newnumber = number._value;
				if (force.to > number._value) {
					newnumber = Math.min(newnumber + force.strength, force.to);
				}
				if (force.to < number._value) {
					newnumber = Math.max(newnumber - force.strength, force.to);
				}
				number._value = newnumber;
			}
			number.frameForces = [];
		}
	};

	return { animationTick, useAnimatedValue, useBouncyValue };
};
