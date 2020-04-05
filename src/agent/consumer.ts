import { UnitAgent, Agent, AgentStateType } from '../defs';

export const MkConsumer = (): Agent => {
	return {
		id: 'TEST_CONSUMER2323',
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🧚‍♀️',
		x: 35,
		y: 15,
	};
};
