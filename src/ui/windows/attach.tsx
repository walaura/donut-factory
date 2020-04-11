import { h, Fragment } from 'preact';
import { Entity, ID } from '../../helper/defs';
import { RevealButton, VisibleButton } from '../components/button';
import { Flex } from '../components/list/flex-list';
import { RowList } from '../components/list/row-list';
import { Info } from '../components/row/info';
import { Scroll } from '../components/Scroll';
import { Heading } from '../components/type';
import { Wash } from '../components/wash';
import { getAgentStatus } from '../helper/status';
import { useLastKnownGameState } from '../hook/use-game-state';
import { useTaskbarItem } from '../hook/use-taskbar/Item';
import { useTaskbar } from '../hook/use-taskbar';

const Row = ({
	entity,
	onAttach,
}: {
	entity: Entity;
	onAttach: (id: ID) => void;
}) => {
	const world = useLastKnownGameState((w) => w);
	const { closeWindow } = useTaskbarItem();
	return (
		<RevealButton
			onClick={() => {
				onAttach(entity.id);
				closeWindow();
			}}>
			<Info center heading={entity.name} icon={entity.emoji}>
				{[getAgentStatus(entity.id, world)]}
			</Info>
		</RevealButton>
	);
};

const AttachWindow = ({
	onAttach,
	filter,
}: {
	onAttach: (id: ID) => void;
	filter: (entity: Entity) => boolean;
}) => {
	const entis = useLastKnownGameState((w) => w.entities);
	const { closeWindow } = useTaskbarItem();

	return (
		<Flex distribute={['squish', 'grow', 'squish']} padding="small">
			<Heading>Pick one</Heading>
			<Wash>
				<Scroll>
					<RowList padding={'normal'}>
						{Object.values(entis)
							.filter(filter)
							.map((enti) => (
								<Row entity={enti} onAttach={onAttach}></Row>
							))}
					</RowList>
				</Scroll>
			</Wash>
			<Fragment>
				<VisibleButton
					onClick={() => {
						closeWindow();
					}}>
					Cancel
				</VisibleButton>
			</Fragment>
		</Flex>
	);
};

const usePushAttachWindow = () => {
	const { push } = useTaskbar();
	return (p: Parameters<typeof AttachWindow>[0]) =>
		push(
			{
				name: 'Attach',
				content: <AttachWindow {...p} />,
			},
			{}
		);
};

export { AttachWindow, usePushAttachWindow };
