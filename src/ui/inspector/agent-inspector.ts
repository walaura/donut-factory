import { UnitAgent, WithColor } from './../../helper/defs';
import { html } from 'lit-html';
import { TabbedWindowProps } from '../$window/$window';
import { MoverAgent } from '../../agent/mover';
import { Entity, EntityType, GameState, ID } from '../../helper/defs';
import { deleteAgent, findEntity, mutateAgent } from '../../loop/loop';
import { $form } from '../components/rows/form';
import { $infoSmall } from '../components/rows/info';
import { $pretty } from '../components/rows/pretty';
import { $rows } from '../components/rows/row';
import { shortNumber } from '../helper/format';
import { getAgentStatus } from '../helper/status';
import { UIStatePriority, useGameState } from '../helper/useGameState';

const $select = ({ values, selected, onChange }) => html`
	<select
		@change=${(ev) => {
			onChange(ev.target.value);
		}}
	>
		${Object.entries(values).map(
			([key, val]) =>
				html`<option
					value=${key}
					?selected=${key.toString() === selected.toString()}
				>
					${val}
				</option>`
		)}
	</select>
`;

const $colorRow = (agent: Entity & WithColor) =>
	$form({
		label: `Color`,
		control: html` <input
			@change=${(ev) => {
				const color = parseInt(ev.target.value, 10);
				mutateAgent<MoverAgent>(
					agent.id,
					(prev, _, [color]) => ({
						...prev,
						color,
					}),
					[color]
				);
			}}
			type="range"
			id="color"
			name="color"
			min="0"
			max="360"
			value=${agent.color}
		/>`,
	});

const $info = (entityId: ID, gameState: GameState) => {
	const agent = findEntity(entityId, gameState);
	if (!agent) {
		return;
	}
	if (agent.type === EntityType.Unit) {
		return $rows(
			[
				agent.exports &&
					$infoSmall({
						label: 'Exports',
						info: [
							{
								body: `${shortNumber(agent.exports)} products`,
								accesory: new Array(Math.ceil(agent.exports) ?? 0)
									.fill('📦')
									.splice(0, 200),
							},
						],
					}),
				agent.imports &&
					$infoSmall({
						label: 'Imports',
						info: [
							{
								body: `${shortNumber(agent.imports)} products`,
								accesory: new Array(Math.ceil(agent.imports))
									.fill('📦')
									.splice(0, 200),
							},
						],
					}),
				$form({ label: 'Name', control: agent.name }),
				$colorRow(agent),
			].filter(Boolean)
		);
	}
	if (agent.type === EntityType.Mover) {
		const tires = {
			5: 'Nice n chill',
			10: 'Balanced',
			20: 'Bananas',
		};

		const deliveries = Object.fromEntries(
			Object.entries(gameState.entities).map(([id, agent]) => [id, agent.name])
		);

		return $rows([
			$infoSmall({
				label: 'Held',
				info: [
					{
						body: `${shortNumber(agent.held)} products`,
						accesory: new Array(Math.ceil(agent.held))
							.fill('📦')
							.splice(0, 200),
					},
				],
			}),
			$form({
				label: 'Deliver from',
				control: $select({
					values: deliveries,
					selected: agent.from[0] ?? '',
					onChange: (from) => {
						mutateAgent<MoverAgent>(
							agent.id,
							(prev, _, [from]) => ({
								...prev,
								from: [from],
							}),
							[from]
						);
					},
				}),
			}),
			$form({
				label: 'Deliver to',
				control: $select({
					values: deliveries,
					selected: agent.to[0] ?? '',
					onChange: (to) => {
						mutateAgent<MoverAgent>(
							agent.id,
							(prev, _, [to]) => ({
								...prev,
								to: [to],
							}),
							[to]
						);
					},
				}),
			}),
			$form({
				label: 'Tires',
				control: $select({
					values: tires,
					selected: agent.offroadSpeed * 10,
					onChange: (val) => {
						const value = parseInt(val, 10) / 10;
						mutateAgent<MoverAgent>(
							agent.id,
							(prev, _, [offroadSpeed]) => ({
								...prev,
								offroadSpeed,
							}),
							[value]
						);
					},
				}),
			}),
			$form({
				label: `This vehicle likes roads a ${agent.preferenceForRoads}/10`,
				control: html`
					<button
						@click="${() => {
							mutateAgent<MoverAgent>(agent.id, (prev) => ({
								...prev,
								preferenceForRoads: prev.preferenceForRoads - 5,
							}));
						}}"
					>
						I live on the edge
					</button>
				`,
			}),
			$colorRow(agent),
		]);
	}
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
			emoji: '🔧',
			name: 'System',
			contents: [
				useGameState((state) => $pretty(findEntity(entityId, state))),
				html`<button
					@click=${() => {
						deleteAgent(entityId);
					}}
				>
					Delete agent
				</button>`,
			],
		},
	],
});
