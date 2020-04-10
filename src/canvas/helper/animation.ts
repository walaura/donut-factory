import { WithID, ID } from '../../helper/defs';

const clamp = ({ min = 0, max = 1 }, number = 0) =>
	Math.min(Math.max(number, min), max);

interface StaticAnimation extends WithID {
	min: number;
	max: number;
	value: number;
	speed: number;
	force: 1 | -1 | 0;
}

interface BouncyAnimation extends StaticAnimation {
	original: number;
}

type Animation = BouncyAnimation | StaticAnimation;

interface AnimatedValue {
	up: () => void;
	down: () => void;
	discard: () => void;
	value: number;
	min: number;
	max: number;
}

type Optional<T, TOptional extends keyof T> = Omit<T, TOptional> &
	Partial<Pick<T, TOptional>>;

const isBouncy = (
	animation: Partial<Animation>
): animation is BouncyAnimation => {
	return 'original' in animation;
};

export const mkAnimations = () => {
	let animations: { [key in string]: Animation } = {};

	const useBaseAnimatedValue = <A extends Animation>(
		animation: Partial<Omit<A, 'force' | 'id'>>,
		id: ID
	): AnimatedValue => {
		if (!animations[id]) {
			animations[id] = {
				value: animation.value ?? 1,
				original: isBouncy(animation) ? animation.original : undefined,
				force: 0,
				speed: animation.speed ?? 10,
				min: animation.min ?? 0,
				max: animation.max ?? 1,
				id,
			};
		}
		return {
			value: animations[id].value,
			min: animations[id].min,
			max: animations[id].max,
			up: () => {
				animations[id].force = 1;
			},
			down: () => {
				animations[id].force = -1;
			},
			discard: () => {
				delete animations[id];
			},
		};
	};

	const useAnimatedValue = (
		animation: Optional<
			Omit<StaticAnimation, 'force' | 'id' | 'original'>,
			'speed' | 'min' | 'max'
		>,
		id: ID
	) => useBaseAnimatedValue(animation, id);

	const useBouncyValue = (
		bounce: Optional<
			Omit<BouncyAnimation, 'force' | 'id' | 'original'>,
			'speed' | 'min' | 'max'
		>,
		id: ID
	) =>
		useBaseAnimatedValue<BouncyAnimation>(
			{ ...bounce, original: bounce.value },
			id
		);

	const animationTick = () => {
		for (let bounce of Object.values(animations)) {
			let forceThisFrame = bounce.force;
			bounce.force = 0;
			if (forceThisFrame) {
				bounce.value = clamp(
					bounce,
					bounce.value + forceThisFrame / bounce.speed
				);
				continue;
			}
			if (isBouncy(bounce)) {
				if (bounce.value > bounce.original) {
					bounce.value = clamp(bounce, bounce.value - 1 / bounce.speed);
				} else if (bounce.value < bounce.original) {
					bounce.value = clamp(bounce, bounce.value + 1 / bounce.speed);
				}
			}
		}
	};

	return { animationTick, useAnimatedValue, useBouncyValue };
};
