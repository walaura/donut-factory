import { h } from 'preact';
import { useState } from 'preact/hooks';
import { MkConsumer } from '../../entity/consumer';
import { MkMover } from '../../entity/vehicle';
import { dispatchToCanvas } from '../../global/dispatch';
import { Entity } from '../../helper/defs';
import { RevealButton, VisibleButton } from '../component/button';
import { RowList } from '../component/list/row-list';
import { Padding } from '../component/primitives/padding';
import { Scroll } from '../component/primitives/scroll';
import { Info } from '../component/row/info';
import { Tabs } from '../component/tabs';
import { Wash } from '../component/wash';
import { getAgentStatus } from '../helper/status';
import { useLastKnownGameState } from '../hook/use-game-state';
import { UIStatePriority } from '../hook/use-global-state';
import { MkRoad, RoadEnd } from '../../entity/road';

const Row = ({ entity }: { entity: Entity }) => {
	const allOfIt = useLastKnownGameState((s) => s, UIStatePriority.Snail);
	return (
		<Padding>
			<RevealButton
				onClick={(ev) => {
					let ghost = entity;
					dispatchToCanvas({
						type: 'set-create-mode-target',
						to: { ghost },
					});
				}}>
				<Info large icon={entity.emoji} heading={entity.name}>
					{[
						getAgentStatus(entity.id, allOfIt),
						'capacity' in entity && <span>Fits {entity.capacity} items</span>,
						'offroadSpeed' in entity && (
							<span>{entity.offroadSpeed * 100}km/h</span>
						),
					]}
				</Info>
			</RevealButton>
		</Padding>
	);
};

const List = ({ entities }: { entities: Entity[] }) => (
	<Padding>
		<Wash>
			<Scroll>
				<VisibleButton
					onClick={() => {
						dispatchToCanvas({
							type: 'set-create-mode-target',
							to: {
								ghost: { ...MkRoad() },
								roadEnd: RoadEnd.start,
							},
						});
					}}>
					add road lol
				</VisibleButton>
				<RowList grid>
					{entities.map((entity) => (
						<Row entity={entity} />
					))}
				</RowList>
			</Scroll>
		</Wash>
	</Padding>
);

export const Hire = () => {
	let [trucks] = useState([
		{ ...MkMover(), name: 'old n reliable' },
		{
			...MkMover(),
			name: 'Cybertruck',
			offroadSpeed: 99999,
			preferenceForRoads: 0,
		},
	]);
	let [faes] = useState([{ ...MkConsumer({ x: 20, y: 40 }) }]);

	return (
		<Tabs>
			{[
				{
					name: 'Trucks',
					emoji: '🚚',
					contents: <List entities={trucks} />,
				},
				{
					name: 'Debug stuff',
					emoji: '👻',
					contents: <List entities={faes} />,
				},
			]}
		</Tabs>
	);
};
