import { WorkerMemory } from './global';

export const getMemory = <Scope extends WorkerMemory['id']>(
	id: Scope
): {
	memory: Extract<WorkerMemory, { id: Scope }>;
} => {
	if (self.memory.id !== id) {
		if (self.memory.id === 'MAIN' && id in self.memory.simulatedWorkers) {
			return {
				memory: self.memory.simulatedWorkers[
					id as Exclude<Scope, 'MAIN'>
				] as Extract<WorkerMemory, { id: Scope }>,
			};
		}
		throw 'nope';
	}
	return { memory: self.memory as Extract<WorkerMemory, { id: Scope }> };
};

export const registerGlobal = <Scope extends WorkerMemory['id']>(
	id: Scope,
	initialMemory: Extract<WorkerMemory, { id: Scope }>
) => {
	if ('memory' in self && 'id' in self.memory) {
		if (
			self.memory.id === 'MAIN' &&
			id !== 'MAIN' &&
			id in self.memory.simulatedWorkers
		) {
			self.memory.simulatedWorkers[
				id as Exclude<Scope, 'MAIN'>
			] = initialMemory;
			return;
		}
		throw 'what';
	}
	self.memory = { id, ...initialMemory };
};
