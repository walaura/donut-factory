import { ID, WithCargo } from '../helper/defs';

export const getCargoQuantity = (productId, state: WithCargo): number =>
	state.cargo[productId]?.quantity ?? 0;

export const buildCargoStore = <T extends WithCargo>(
	productId: ID,
	state: T
): T => {
	if (!state.cargo[productId]) {
		state.cargo[productId] = {
			productId,
			quantity: 0,
		};
	}
	return state;
};

export const addCargo = <T extends WithCargo>(
	productId: ID,
	quantity: number,
	state: T
): T => {
	state = buildCargoStore(productId, state);
	state.cargo[productId].quantity = Math.max(
		state.cargo[productId].quantity + quantity,
		0
	);
	return state;
};
