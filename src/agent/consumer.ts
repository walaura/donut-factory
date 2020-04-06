import { XY } from './../defs';
import { UnitAgent, Agent, AgentStateType } from '../defs';
import { addId, addPosition } from './helper/generate';

export const MkConsumer = (xy: XY): UnitAgent => {
	return {
		...addId(),
		...addPosition(xy),
		name: 'Fairy lalal',
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🧚‍♀️',
	};
};
