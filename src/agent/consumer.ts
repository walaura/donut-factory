import { UnitAgent, Agent, AgentStateType } from '../helper/defs';
import { addId, addPosition } from './helper/generate';
import { XY } from '../helper/xy';
import { makeConsumerName } from '../helper/names';

export const MkConsumer = (xy: XY): UnitAgent => {
	return {
		...addId(),
		...addPosition(xy),
		color: 0,
		name: makeConsumerName(),
		exports: 0,
		imports: 0,
		type: AgentStateType.UNIT,
		emoji: '🧚‍♀️',
	};
};
