import { UnitAgent, Agent, AgentStateType } from '../helper/defs';
import { addId, addPosition } from './helper/generate';
import { XY } from '../helper/xy';

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
