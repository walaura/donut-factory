import { h, Fragment } from 'preact';
import { ID } from '../../../helper/defs';
import { RowList } from '../../component/list/row-list';
import { Pre } from '../../component/primitives/pre';
import { Info } from '../../component/row/info';
import { useLastKnownEntityState } from '../../hook/use-game-state';
import { Target } from '../../../helper/target';
import { XY } from '../../../helper/xy';
import { RevealButton } from '../../component/button';
import { useTaskbar } from '../../hook/use-taskbar';
import { SerializableRoute } from '../../helper/route.defs.ts';
const PathInfoTabEntityRow = ({
	target,
}: {
	target: Target & {
		entityId: ID;
	};
}) => {
	let { push } = useTaskbar();
	let entity = useLastKnownEntityState(target.entityId);
	if (!entity || entity == null) {
		return null;
	}
	let route: SerializableRoute = ['entity', { entityId: entity.id }];
	return (
		<RevealButton
			onClick={(ev) => {
				push({ route }, { ev });
			}}>
			<Info heading={entity.name} icon={entity.emoji}>
				<Fragment>{'roadEnd' in target && target.roadEnd}</Fragment>
				<Pre>{target}</Pre>
			</Info>
		</RevealButton>
	);
};
const PathInfoTabXYRow = ({
	target,
}: {
	target: Target & {
		xy: XY;
	};
}) => {
	return (
		<Info
			heading={`Going to X:${target.xy.x}, Y:${target.xy.y}`}
			icon={'🗺'}></Info>
	);
};
export const PathInfoTab = ({ entityId }: { entityId: ID }) => {
	const vehicle = useLastKnownEntityState(entityId);
	if (!vehicle || !('path' in vehicle)) {
		return null;
	}
	return (
		<RowList padding={'normal'}>
			{vehicle.path.map((target) =>
				'entityId' in target ? (
					<PathInfoTabEntityRow target={target} />
				) : (
					<PathInfoTabXYRow target={target}></PathInfoTabXYRow>
				)
			)}
		</RowList>
	);
};
