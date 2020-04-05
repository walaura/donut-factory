export type Movement = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export const addSpeedToMovement = (
	movement: Movement,
	speed: number
): Movement => ({
	right: movement.right * speed,
	left: movement.left * speed,
	bottom: movement.bottom * speed,
	top: movement.top * speed,
});
