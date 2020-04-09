import {
	Entity,
	WithColor,
	GameState,
	EntityType,
	WithCargo,
	ID,
} from '../../helper/defs';
import { $form } from '../components/rows/form';
import { html } from 'lit-html';
import { Vehicle } from '../../entity/vehicle';
import {
	Order,
	Load,
	mkMoveOrder,
	linkOrder,
	clearOrders,
} from '../../entity/composables/with-orders';
import { $t } from '../components/type';
import { findEntity, addEntity, mergeEntity } from '../../game/entities';
import { generateWindowEv, TabbedWindowProps } from '../$window';
import { attachWindow } from '../windows/attach';
import { $rows } from '../components/rows/row';
import { $infoSmall, $infoBig } from '../components/rows/info';
import { getAgentStatus } from '../helper/status';
import { $pretty } from '../components/rows/pretty';
import { Road } from '../../entity/road';
import { shortNumber } from '../helper/format';
import { TemplateHole } from '../helper/defs';
import { $select } from '../components/form/$select';
import { useGameState, UIStatePriority } from '../helper/useGameState';
import { $buttonGrid } from '../components/form/$buttonGrid';
import { dispatch } from '../../global/actions';

const $colorRow = (agent: Entity & WithColor) =>
	$form({
		label: `Color`,
		control: html` <input
			@change=${(ev) => {
				const color = parseInt(ev.target.value, 10);
				mergeEntity<Vehicle>(agent.id, {
					color,
				});
			}}
			type="range"
			id="color"
			name="color"
			min="0"
			max="360"
			value=${agent.color}
		/>`,
	});

const $orderInspector = (order: Order, state: GameState) => {
	if ('load' in order) {
		return $form({
			label: $t(findEntity(order.load.product, state)),
			control: html`<button
				@click=${(ev) => {
					generateWindowEv(ev)(
						attachWindow({
							onAttach: (product) => {
								mergeEntity<Order & { load: Load }>(order.id, {
									load: {
										product,
									},
								});
							},
							filter: (agent) => {
								return agent.type === EntityType.Product;
							},
						})
					);
				}}
			>
				Change product
			</button>`,
		});
	}
	return null;
};

const $orderInfo = (vehicle: Vehicle, state: GameState) =>
	$rows([
		...Object.values(vehicle.orders.list).map((orderId, index) => {
			const order = findEntity(orderId, state);
			if (!order || order.type !== EntityType.Order) {
				return 'Things messed up yo';
			}
			return $infoSmall({
				onClick: (ev) => generateWindowEv(ev)(agentInspector(orderId)),
				label: vehicle.orders.position === index ? '🚦<HERE>' : '💤',
				info: [{ body: getAgentStatus(order.id, state) }],
			});
		}),
		$pretty(vehicle.orders.state),
	]);

const $roadInfo = (road: Road, state: GameState) => [
	$form({
		label: 'Start',
		control: html`
			<div>
				<input
					@change=${(ev) => {
						let x = parseInt(ev.target.value);
						mergeEntity<Road>(road.id, {
							start: {
								x,
							},
						});
					}}
					type="number"
					step="1"
					value=${road.start.x}
				/>
				<input
					@change=${(ev) => {
						mergeEntity<Road>(road.id, {
							start: {
								y: parseInt(ev.target.value),
							},
						});
					}}
					type="number"
					step="1"
					value=${road.start.y}
				/>
			</div>
		`,
	}),
	$form({
		label: 'End',
		control: html`
			<div>
				<input
					@change=${(ev) => {
						let x = parseInt(ev.target.value);
						mergeEntity<Road>(road.id, {
							end: {
								x,
							},
						});
					}}
					type="number"
					step="1"
					value=${road.end.x}
				/>
				<input
					@change=${(ev) => {
						mergeEntity<Road>(road.id, {
							end: {
								y: parseInt(ev.target.value),
							},
						});
					}}
					type="number"
					step="1"
					value=${road.end.y}
				/>
			</div>
		`,
	}),
];

const $pathInfo = (vehicle: Vehicle, state: GameState) =>
	$rows(
		vehicle.path.map((t) => {
			if ('entityId' in t) {
				let entity = findEntity(t.entityId, state);
				if (!entity) return 'uhhhh';
				return $infoBig({
					heading: entity.name,
					icon: entity.emoji,
					accesories: ['roadEnd' in t && t.roadEnd, $pretty(t)].filter(Boolean),
				});
			}
		})
	);

const $cargoRows = (cargo: WithCargo['cargo'], gameState: GameState) =>
	Object.values(cargo).map((load) => {
		let entity = findEntity(load.productId, gameState);
		let total = load.quantity;
		if (!entity) {
			return $pretty(load);
		}
		return $infoSmall({
			label: entity.name,
			info: [
				{
					body: `${shortNumber(load.quantity)} ${entity.name}`,
					accesory: new Array(Math.max(0, Math.ceil(total) ?? 0))
						.fill(entity.emoji)
						.splice(0, 200),
				},
			],
		});
	});
const $info = (entityId: ID, gameState: GameState) => {
	const agent = findEntity(entityId, gameState);
	if (!agent) {
		return;
	}
	let rows: TemplateHole[] = [];
	if ('cargo' in agent) {
		rows.push(...$cargoRows(agent.cargo, gameState));
	}
	if ('start' in agent) {
		rows.push($roadInfo(agent, gameState));
	}

	if ('color' in agent) {
		rows.push($colorRow(agent));
	}

	if ('load' in agent) {
		rows.push($orderInspector(agent, gameState));
	}

	if (agent.type === EntityType.Vehicle) {
		const tires = {
			5: 'Nice n chill',
			10: 'Balanced',
			20: 'Bananas',
		};

		rows.push(
			...[
				$form({
					label: 'Tires',
					control: $select({
						values: tires,
						selected: agent.offroadSpeed * 10,
						onChange: (val) => {
							const offroadSpeed = parseInt(val, 10) / 10;
							mergeEntity<Vehicle>(agent.id, {
								offroadSpeed,
							});
						},
					}),
				}),
				$form({
					label: `This vehicle likes roads a ${agent.preferenceForRoads}/10`,
					control: html`
						<input
							@change=${(ev) => {
								const preferenceForRoads = parseInt(ev.target.value, 10);
								mergeEntity<Vehicle>(agent.id, {
									preferenceForRoads,
								});
							}}
							type="range"
							min="0"
							max="10"
							value=${agent.preferenceForRoads}
						/>
					`,
				}),
			]
		);
	}

	return $rows(rows.filter(Boolean));
};

export const agentInspector = (entityId: ID): TabbedWindowProps => ({
	title: useGameState((state) => findEntity(entityId, state)?.name) ?? 'info',
	emoji: useGameState((state) => findEntity(entityId, state)?.emoji),
	tabs: [
		{
			emoji: 'ℹ️',
			name: 'Basic',
			contents: [
				useGameState((state) => $info(entityId, state), UIStatePriority.Sonic),
				useGameState(
					(state) => getAgentStatus(entityId, state),
					UIStatePriority.Cat
				),
			],
		},
		{
			emoji: '🛣',
			name: 'Paths',
			shows: useGameState(
				(state) => findEntity(entityId, state)?.type === EntityType.Vehicle,
				UIStatePriority.Snail
			),
			contents: [
				useGameState((state) => {
					let entity = findEntity(entityId, state);
					if (entity && entity.type === EntityType.Vehicle) {
						return $pathInfo(entity, state);
					}
				}, UIStatePriority.Snail),
			],
		},
		{
			emoji: '📥',
			name: 'Orders',
			shows: useGameState(
				(state) => findEntity(entityId, state)?.type === EntityType.Vehicle,
				UIStatePriority.Snail
			),
			contents: [
				useGameState((state) => {
					let entity = findEntity(entityId, state);
					if (entity && entity.type === EntityType.Vehicle) {
						return $orderInfo(entity, state);
					}
				}, UIStatePriority.Snail),
				$buttonGrid(html`<button
						@click=${(ev) => {
							generateWindowEv(ev)(
								attachWindow({
									onAttach: (newId) => {
										const order = mkMoveOrder(newId);
										addEntity(order);
										linkOrder(entityId, order.id);
									},
									filter: (agent) => {
										return agent.type !== EntityType.Order;
									},
								})
							);
						}}
					>
						add new order
					</button>
					<button
						@click=${() => {
							clearOrders(entityId);
						}}
					>
						clear orders
					</button>
					<button
						@click=${(ev) => {
							generateWindowEv(ev)(
								attachWindow({
									onAttach: (newId) => {
										linkOrder(entityId, newId);
									},
									filter: (agent) => {
										return agent.type === EntityType.Order;
									},
								})
							);
						}}
					>
						add existing order
					</button>`),
			],
		},
		{
			emoji: '🔧',
			name: 'System',
			contents: [
				useGameState((state) => $pretty(findEntity(entityId, state))),
				html`<button
					@click=${() => {
						dispatch({
							type: 'delete-entity',
							entityId,
						});
					}}
				>
					Delete agent
				</button>`,
			],
		},
	],
});
