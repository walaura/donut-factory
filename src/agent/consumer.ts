import { EntityType } from '../helper/defs';
import { addId, addPosition } from '../helper/generate';
import { makeConsumerName } from '../helper/names';
import { XY } from '../helper/xy';
import { UnitAgent } from './factory';

export const MkConsumer = (xy: XY): UnitAgent => {
	return {
		...addId(),
		...addPosition(xy),
		produces: [],
		cargo: {},
		color: 0,
		name: makeConsumerName(),
		exports: 0,
		imports: 0,
		type: EntityType.Unit,
		emoji: '🧚‍♀️',
	};
};
