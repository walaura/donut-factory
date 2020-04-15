import { WorkerMemory } from './global';

type WorkerMemoryFor<Scope> = Extract<WorkerMemory, { id: Scope }>;

const getSimulatedMemoryMaybe = <Scope extends WorkerMemory['id']>(
	id: Scope
): {
	memory: WorkerMemoryFor<Scope>;
} | null => {
	if (
		self.memory.id === 'MAIN' &&
		id !== 'MAIN' &&
		id in self.memory.simulatedWorkers
	) {
		return {
			memory: self.memory.simulatedWorkers[
				id as Exclude<Scope, 'MAIN'>
			] as WorkerMemoryFor<Scope>,
		};
	}
	return null;
};

export const getMemory = <Scope extends WorkerMemory['id']>(
	id: Scope
): {
	memory: WorkerMemoryFor<Scope>;
} => {
	if (self.memory.id !== id) {
		let simulated = getSimulatedMemoryMaybe<Scope>(id);
		if (simulated != null) {
			return simulated;
		}
		throw `Cant access ${id} from ${self.memory.id}`;
	}
	return { memory: self.memory as WorkerMemoryFor<Scope> };
};

export const registerGlobal = <Scope extends WorkerMemory['id']>(
	id: Scope,
	initialMemory: Extract<WorkerMemory, { id: Scope }>
) => {
	if ('memory' in self && 'id' in self.memory) {
		if (id !== 'MAIN' && self.memory.id === 'MAIN') {
			let simulated = getSimulatedMemoryMaybe<Scope>(id);
			if (simulated != null) {
				simulated.memory = { id, ...initialMemory };
				return;
			}
			throw `Failed to create sim memory for [${id}]`;
		}
	}
	self.memory = { id, ...initialMemory };
};
