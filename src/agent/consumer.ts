import { UnitAgent, Agent, AgentStateType } from '../defs';

export const MkConsumer = (): Agent => {
	return {
		id: 'TEST_CONSUMER',
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🧚‍♀️',
		x: 30,
		y: 15,
	};
};
