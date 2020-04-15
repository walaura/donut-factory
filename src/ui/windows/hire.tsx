import { h } from 'preact';
import { MkConsumer } from '../../entity/consumer';
import { MkMover } from '../../entity/vehicle';
import { addEntity } from '../../game/entities';
import { Entity, entityHasXY, LastKnownGameState } from '../../helper/defs';
import { RevealButton, VisibleButton } from '../component/button';
import { Info } from '../component/row/info';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Tabs } from '../component/tabs';
import { getAgentStatus } from '../helper/status';
import { useLastKnownGameState } from '../hook/use-game-state';
import { UIStatePriority } from '../hook/use-global-state';
import { useTaskbar } from '../hook/use-taskbar/context';
import { dispatchToCanvas } from '../../global/dispatch';

const Row = ({ entity }: { entity: Entity }) => {
	const allOfIt = useLastKnownGameState((s) => s, UIStatePriority.Snail);
	const { push } = useTaskbar();
	return (
		<Padding>
			<RevealButton
				onClick={(ev) => {
					push({ route: ['entity', { entityId: entity.id }] }, { ev });
				}}>
				<Info icon={entity.emoji} heading={entity.name}>
					{[getAgentStatus(entity.id, allOfIt)]}
				</Info>
			</RevealButton>
		</Padding>
	);
};

const FilteredEntities = ({
	entities,
	filter,
}: {
	entities: LastKnownGameState['entities'];
	filter: (f: Entity) => boolean;
}) => (
	<RowList>
		{Object.values(entities)
			.filter(filter)
			.map((entity) => (
				<Row entity={entity} />
			))}
	</RowList>
);

export const Hire = () => {
	const entities = useLastKnownGameState(
		(s) => s.entities,
		UIStatePriority.Snail
	);
	return (
		<Tabs>
			{[
				{
					name: 'Trucks',
					emoji: '🚚',
					contents: (
						<FilteredEntities entities={entities} filter={entityHasXY} />
					),
				},
				{
					name: 'Debug stuff',
					emoji: '👻',
					contents: (
						<FilteredEntities
							entities={entities}
							filter={(en) => !entityHasXY(en)}
						/>
					),
				},
			]}
		</Tabs>
	);
};