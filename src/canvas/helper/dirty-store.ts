import { WithID, ID } from '../../helper/defs';

/*
Sometimes things can take a couple frames to 
end just right, for example leaving edit mode will
still have an ite, on its old position for a bit before
reflecting the 'right' state – use the dirt store to keep
v short lived references to shit like this
*/
type DirtyStore<T extends WithID> = {
	item: T;
	ticksLeft: number;
}[];
export const mkDirtyStore = <T extends WithID>() => {
	let store: DirtyStore<T> = [];
	const onTick = () => {
		store = store
			.map((item) => ({ ...item, ticksLeft: item.ticksLeft - 1 }))
			.filter(({ ticksLeft }) => ticksLeft > 0);
		for (let item of store) {
			item.ticksLeft = item.ticksLeft - 1;
		}
	};
	const add = (item: T) => {
		if (!get(item.id))
			store.push({
				ticksLeft: 10,
				item,
			});
	};
	const get = (id: ID) => store.find((ex) => ex.item.id === id)?.item;

	return { onTick, get, add };
};
