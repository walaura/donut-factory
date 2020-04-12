import { WorkerMemory } from './global/global';

declare global {
	interface Window {
		memory: WorkerMemory;
	}
}
