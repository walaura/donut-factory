import { h, Fragment } from 'preact';
import { Entity, ID } from '../../helper/defs';
import { RevealButton, VisibleButton } from '../component/button';
import { Flex } from '../component/list/flex-list';
import { RowList } from '../component/list/row-list';
import { Info } from '../component/row/info';
import { Heading } from '../component/type';
import { Wash } from '../component/wash';
import { getAgentStatus } from '../helper/status';
import { useLastKnownGameState } from '../hook/use-game-state';
import { useTaskbarItem } from '../hook/use-taskbar/item';
import { useTaskbar } from '../hook/use-taskbar';
import { Scroll } from '../component/primitives/scroll';

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
