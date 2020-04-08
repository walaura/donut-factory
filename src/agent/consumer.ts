import { EntityType, UnitAgent } from '../helper/defs';
import { addId, addPosition } from '../helper/generate';
import { makeConsumerName } from '../helper/names';
import { XY } from '../helper/xy';

export const MkConsumer = (xy: XY): UnitAgent => {
	return {
		...addId(),
		...addPosition(xy),
		color: 0,
		name: makeConsumerName(),
		exports: 0,
		imports: 0,
		type: EntityType.Unit,
		emoji: '🧚‍♀️',
	};
};
