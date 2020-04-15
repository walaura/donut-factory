import { h } from 'preact';
import {
	clearOrders,
	linkOrder,
	Load,
	Order,
} from '../../../../entity/composables/with-orders';
import { mergeEntity } from '../../../../game/entities';
import { EntityType, ID } from '../../../../helper/defs';
import { RevealButton, VisibleButton } from '../../../component/button';
import { Flex } from '../../../component/list/flex-list';
import { RowList } from '../../../component/list/row-list';
import { MiniGrid } from '../../../component/primitives/mini-grid';
import { Padding } from '../../../component/primitives/padding';
import { Scroll } from '../../../component/primitives/scroll';
import { Info } from '../../../component/row/info';
import { useEntityStatus } from '../../../helper/status';
import { useLastKnownEntityState } from '../../../hook/use-game-state';
import { useTaskbar } from '../../../hook/use-taskbar/context';
import { usePushAttachWindow } from '../../attach';
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
		<Flex distribute={['grow', 'squish']} dividers>
			<Scroll>
				<RowList padding="normal">
					{Object.values(ordered.orders.list).map((orderId, index) => (
						<OrderInfoRow
							active={ordered.orders.position === index}
							orderId={orderId}
						/>
					))}
				</RowList>
			</Scroll>
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
