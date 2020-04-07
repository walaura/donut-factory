import { html } from 'lit-html';
import { MoverAgent } from '../../agent/mover';
import { AgentStateType, GameState, ID, Agent } from '../../helper/defs';
import { findAgent, mutateAgent, addAgent, deleteAgent } from '../../loop/loop';
import { UIStatePriority, useGameState } from '../helper/useGameState';
import { getAgentStatus } from '../helper/status';
import { $pretty } from './rows/pretty';
import { $window, $tabbedWindow } from './window';
import { $form } from './rows/form';
import { $rows } from './rows/row';
import { $infoSmall } from './rows/info';
import { shortNumber } from '../helper/format';

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

const $colorRow = (agent: Agent) =>
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

const $info = (agentId: ID, gameState: GameState) => {
	const agent = findAgent(agentId, gameState);
	if (!agent) {
		return;
	}
	if (agent && agent.type !== AgentStateType.MOVER) {
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

	const tires = {
		5: 'Nice n chill',
		10: 'Balanced',
		20: 'Bananas',
	};

	const deliveries = Object.fromEntries(
		Object.entries(gameState.agents).map(([id, agent]) => [id, agent.name])
	);

	return $rows([
		$infoSmall({
			label: 'Held',
			info: [
				{
					body: `${shortNumber(agent.held)} products`,
					accesory: new Array(Math.ceil(agent.held)).fill('📦').splice(0, 200),
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
};

const $agentWindow = (agentId: ID) =>
	$tabbedWindow(
		useGameState((state) => findAgent(agentId, state)?.emoji),
		'Agent info',
		[
			{
				emoji: 'ℹ️',
				name: 'Basic',
				contents: [
					useGameState((state) => $info(agentId, state), UIStatePriority.Sonic),
					useGameState(
						(state) => getAgentStatus(agentId, state),
						UIStatePriority.Cat
					),
				],
			},
			{
				emoji: '🔧',
				name: 'System',
				contents: [
					useGameState((state) => $pretty(findAgent(agentId, state))),
					html`<button
						@click=${() => {
							deleteAgent(agentId);
						}}
					>
						Delete agent
					</button>`,
				],
			},
		]
	);

export { $agentWindow };
