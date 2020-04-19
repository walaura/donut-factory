import { WithID, ID } from '../../helper/defs';

/*
Sometimes things can take a couple frames to 
end just right, for example leaving edit mode will
still have an ite, on its old position for a bit before
reflecting the 'right' state – use the dirt store to keep
v short lived references to shit like this
*/
export const mkDirtyStore = <T extends WithID>() => {
	let store: Map<ID, T> = new Map();
	let ticksLeftStore: WeakMap<T, number> = new WeakMap();
	const onTick = () => {
		for (let [id, value] of store.entries()) {
			let ticksLeft = ticksLeftStore.get(value) ?? 15;
			if (ticksLeft > 0) {
				ticksLeftStore.set(value, ticksLeft - 1);
			} else {
				store.delete(id);
			}
		}
	};
	const add = (item: T) => {
		store.set(item.id, item);
	};
	const get = (id: ID) => store.get(id);
	const getAll = () => [...store.values()];
	return { onTick, get, getAll, add };
};
