import { h } from 'preact';
import { ID, EntityType } from '../../../helper/defs';
import { RevealButton, VisibleButton } from '../../components/button';
import { RowList } from '../../components/list/row-list';
import { Info } from '../../components/row/info';
import { useLastKnownEntityState } from '../../hook/use-game-state';
import { useTaskbar } from '../../hook/use-taskbar';
import { useEntityStatus } from '../../helper/status';
import { Flex } from '../../components/list/flex-list';
import { Padding } from '../../components/primitives/padding';
import { MiniGrid } from '../../components/primitives/mini-grid';
import { useTaskbarItem } from '../../hook/use-taskbar/item';
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
				<MiniGrid layout={'fluffy'}>
					<VisibleButton
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
