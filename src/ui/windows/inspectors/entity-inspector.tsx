import { h, JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import { Load, Order } from '../../../entity/composables/with-orders';
import { entityIsRoad, RoadEnd } from '../../../entity/road';
import { mergeEntity } from '../../../game/entities';
import { dispatchToCanvas } from '../../../global/dispatch';
import {
	Entity,
	EntityType,
	ID,
	WithCargo,
	WithColor,
} from '../../../helper/defs';
import { VisibleButton } from '../../component/button';
import { RowList } from '../../component/list/row-list';
import { Accesory } from '../../component/primitives/accesory';
import { MiniGrid } from '../../component/primitives/mini-grid';
import { Pre } from '../../component/primitives/pre';
import { Form } from '../../component/row/form';
import { Info } from '../../component/row/info';
import { Tabs } from '../../component/tabs';
import { shortNumber } from '../../helper/format';
import { useEntityStatus } from '../../helper/status';
import { useLastKnownEntityState } from '../../hook/use-game-state';
import { useTaskbar } from '../../hook/use-taskbar/context';
import { useTaskbarItem } from '../../hook/use-taskbar/item';
import { AttachWindow } from '../attach';
import { OrderInfoTab } from './tab/orders';
import { PathInfoTab } from './tab/path';
import { EntitySettingsTab } from './tab/settings';

const OrderLoadRow = ({ order }: { order: Order & { load: Load } }) => {
	const { push } = useTaskbar();
	return (
		<Form label={order.name}>
			<VisibleButton
				onClick={() => {
					push(
						{
							name: 'Attach',
							content: (
								<AttachWindow
									onAttach={(product) => {
										mergeEntity<Order & { load: Load }>(order.id, {
											load: {
												product,
											},
										});
									}}
									filter={(agent) => {
										return agent.type !== EntityType.Order;
									}}
								/>
							),
						},
						{}
					);
				}}>
				Change product
			</VisibleButton>
		</Form>
	);
};

const OrderLoadRows = ({ entityId }: { entityId: ID }) => {
	const order = useLastKnownEntityState(entityId);
	if (!order || !('load' in order)) {
		return null;
	}
	return <OrderLoadRow order={order} />;
};

const RoadRow = ({ entityId }: { entityId: ID }) => {
	const road = useLastKnownEntityState(entityId);
	if (!road || !entityIsRoad(road)) return null;

	return (
		<Form label={'Road'}>
			<MiniGrid>
				{[RoadEnd.start, RoadEnd.end].map((roadEnd) => (
					<VisibleButton
						onClick={() => {
							dispatchToCanvas({
								type: 'set-edit-mode-target',
								to: {
									entityId: road.id,
									roadEnd,
								},
							});
						}}>
						Set {roadEnd}
					</VisibleButton>
				))}
			</MiniGrid>
		</Form>
	);
};

const ColorRow = ({ entityId }: { entityId: ID }) => {
	const entity = useLastKnownEntityState(entityId);
	if (!entity || !('color' in entity)) return null;

	return (
		<Form label={'Color'}>
			<input
				onChange={(ev) => {
					//@ts-ignore
					const color = parseInt(ev?.target?.value ?? 0, 10);
					mergeEntity<Entity & WithColor>(entity.id, {
						color,
					});
				}}
				type="range"
				id="color"
				name="color"
				min="0"
				max="360"
				value={entity.color}
			/>
		</Form>
	);
};

const CargoRow = ({ load }: { load: WithCargo['cargo'][string] }) => {
	const product = useLastKnownEntityState(load.productId);
	let { quantity } = load;
	if (!product) {
		return <Pre>{load}</Pre>;
	}
	return (
		<Info heading={product.name}>
			<Accesory
				accesory={new Array(Math.max(0, Math.ceil(quantity) ?? 0))
					.fill(product.emoji)
					.splice(0, 200)}>
				{shortNumber(quantity) + ' ' + product.name}
			</Accesory>
		</Info>
	);
};

const EntityInfoTab = ({ entityId }: { entityId: ID }) => {
	const entity = useLastKnownEntityState(entityId);
	const status = useEntityStatus(entityId);
	if (!entity) {
		return null;
	}
	let rows: (string | JSX.Element)[] = [];

	status && rows.push(status);

	if ('cargo' in entity) {
		for (let cargo of Object.values(entity.cargo)) {
			rows.push(<CargoRow load={cargo} />);
		}
	}
	if ('color' in entity) {
		rows.push(<ColorRow entityId={entityId} />);
	}
	if ('load' in entity) {
		rows.push(<OrderLoadRows entityId={entityId} />);
	}
	if (entityIsRoad(entity)) {
		rows.push(<RoadRow entityId={entityId} />);
	}
	rows.push(<Pre>{entity}</Pre>);
	if ('x' in entity) {
		rows.push(
			<MiniGrid layout={'fluffy'}>
				<VisibleButton
					onClick={() => {
						dispatchToCanvas({
							type: 'set-follow-target',
							to: {
								entityId: entity.id,
							},
						});
					}}>
					Follow
				</VisibleButton>
			</MiniGrid>
		);
	}
	return <RowList padding="normal">{rows}</RowList>;
};

export const EntityInspector = ({ entityId }: { entityId: ID }) => {
	const { setIdentifiers } = useTaskbarItem();

	const entity = useLastKnownEntityState(entityId);
	useEffect(() => {
		entity && setIdentifiers(entity);
	}, [entity?.name]);

	return (
		<Tabs>
			{[
				{
					emoji: 'ℹ️',
					name: 'Basic',
					contents: <EntityInfoTab entityId={entityId} />,
				},
				{
					emoji: '📥',
					name: 'Orders',
					shows: entity?.type === EntityType.Vehicle,
					contents: <OrderInfoTab entityId={entityId} />,
				},
				{
					emoji: '🛣',
					name: 'Paths',
					shows: entity?.type === EntityType.Vehicle,
					contents: <PathInfoTab entityId={entityId} />,
				},
				{
					emoji: '🔧',
					name: 'System',
					contents: <EntitySettingsTab entityId={entityId} />,
				},
			]}
		</Tabs>
	);
};
