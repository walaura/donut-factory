import { XY } from '../helper/xy';
import { UnitAgent } from './factory';
import { addId, addPosition } from '../helper/generate';
import { makeConsumerName } from '../helper/names';
import { EntityType } from '../helper/defs';

export const MkConsumer = (xy: XY): UnitAgent => {
	return {
		...addId(),
		...addPosition(xy),
		produces: [],
		cargo: {},
		color: 0,
		name: makeConsumerName(),
		type: EntityType.Unit,
		emoji: '🧚‍♀️',
	};
};
