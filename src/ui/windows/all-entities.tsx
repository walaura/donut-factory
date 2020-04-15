import { h } from 'preact';
import { Entity, entityHasXY, LastKnownGameState } from '../../helper/defs';
import { RevealButton } from '../component/button';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Info } from '../component/row/info';
import { Tabs } from '../component/tabs';
import { getAgentStatus } from '../helper/status';
import { useLastKnownGameState } from '../hook/use-game-state';
import { UIStatePriority } from '../hook/use-global-state';
import { useTaskbar } from '../hook/use-taskbar/context';

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

export const AllEntitities = () => {
	const entities = useLastKnownGameState(
		(s) => s.entities,
		UIStatePriority.Snail
	);
	return (
		<Tabs sideways>
			{[
				{
					name: 'useful agents',
					emoji: '🚚',
					contents: (
						<FilteredEntities entities={entities} filter={entityHasXY} />
					),
				},
				{
					name: 'All other agents',
					emoji: '📋',
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
