import { h } from 'preact';
import { Entity, entityHasXY, LastKnownGameState } from '../../helper/defs';
import { Info } from '../components/Info/Info';
import { RowList } from '../components/List/RowList';
import { Padding } from '../components/Padding';
import { getAgentStatus } from '../helper/status';
import { UIStatePriority, useLastKnownGameState } from '../hook/use-game-state';
import { Tabs } from '../components/Tabs';
import { VisibleButton, RevealButton } from '../components/Button';
import { addEntity } from '../../game/entities';
import { MkConsumer } from '../../entity/consumer';
import { MkMover } from '../../entity/vehicle';
import { useOverlayHandles, useOverlays } from '../hook/use-overlays';

const Row = ({ entity }: { entity: Entity }) => {
	const allOfIt = useLastKnownGameState((s) => s, UIStatePriority.Snail);
	const { pushRoute } = useOverlays();
	return (
		<Padding>
			<RevealButton
				onClick={(ev) => {
					pushRoute(ev, ['entity', { entityId: entity.id }]);
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
				{
					name: 'Build/Hire',
					emoji: '⛑',
					contents: (
						<RowList>
							<Padding>
								<VisibleButton
									onClick={() => {
										addEntity(MkConsumer({ x: 20, y: 40 }));
									}}>
									Add fairy
								</VisibleButton>
							</Padding>
							<Padding>
								<VisibleButton
									onClick={() => {
										addEntity(MkMover());
									}}>
									Add truck
								</VisibleButton>
							</Padding>
						</RowList>
					),
				},
			]}
		</Tabs>
	);
};
