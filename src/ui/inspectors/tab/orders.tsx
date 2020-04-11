import { h } from 'preact';
import { ID, EntityType } from '../../../helper/defs';
import { RevealButton, VisibleButton } from '../../components/Button';
import { RowList } from '../../components/List/RowList';
import { Info } from '../../components/row/Info';
import { useLastKnownEntityState } from '../../hook/use-game-state';
import { useTaskbar } from '../../hook/use-taskbar';
import { useEntityStatus } from '../../helper/status';
import { Flex } from '../../components/List/FlexList';
import { Padding } from '../../components/primitives/Padding';
import { MiniGrid } from '../../components/primitives/MiniGrid';
import { useTaskbarItem } from '../../hook/use-taskbar/Item';
import { AttachWindow, usePushAttachWindow } from '../../windows/attach';
import { mergeEntity } from '../../../game/entities';
import {
	Order,
	Load,
	clearOrders,
	linkOrder,
} from '../../../entity/composables/with-orders';
const OrderInfoRow = ({
	active,
	orderId,
}: {
	active: boolean;
	orderId: ID;
}) => {
	const order = useLastKnownEntityState(orderId);
	const status = useEntityStatus(orderId);
	const { push } = useTaskbar();
	if (!order || order.type !== EntityType.Order) {
		return null;
	}
	return (
		<RevealButton
			onClick={(ev) => {
				push({ route: ['entity', { entityId: orderId }] }, { ev });
			}}>
			<Info
				center
				icon={active ? '🚦' : '💤'}
				heading={active ? '<HERE>' : null}>
				{status}
			</Info>
		</RevealButton>
	);
};
export const OrderInfoTab = ({ entityId }: { entityId: ID }) => {
	const ordered = useLastKnownEntityState(entityId);
	const pushAttach = usePushAttachWindow();
	if (!ordered || !('orders' in ordered)) {
		return null;
	}
	return (
		<Flex distribute={['scroll', 'squish']} dividers>
			<RowList padding="normal">
				{Object.values(ordered.orders.list).map((orderId, index) => (
					<OrderInfoRow
						active={ordered.orders.position === index}
						orderId={orderId}
					/>
				))}
			</RowList>
			<Padding>
				<MiniGrid>
					<VisibleButton
						layout={'square'}
						icon={'✨'}
						onClick={() => {
							pushAttach({
								onAttach: (product) => {
									mergeEntity<Order & { load: Load }>(entityId, {
										load: {
											product,
										},
									});
								},
								filter: (entity) => {
									return entity.type !== EntityType.Order;
								},
							});
						}}>
						Add new order
					</VisibleButton>
					<VisibleButton
						layout={'square'}
						icon={'✨'}
						onClick={() => {
							pushAttach({
								onAttach: (newId) => {
									linkOrder(entityId, newId);
								},
								filter: (entity) => {
									return entity.type === EntityType.Order;
								},
							});
						}}>
						Attach existing order
					</VisibleButton>
					<VisibleButton
						layout={'square'}
						icon={'🗑'}
						onClick={() => {
							clearOrders(entityId);
						}}>
						Clear orders
					</VisibleButton>
				</MiniGrid>
			</Padding>
		</Flex>
	);
};
