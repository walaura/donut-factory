import { html } from 'lit-html';
import { MoverAgent } from '../../agent/mover';
import { AgentStateType, GameState, ID, Agent } from '../../helper/defs';
import { findAgent, mutateAgent } from '../../loop/loop';
import { UIStatePriority, useGameState } from '../helper/state';
import { getAgentStatus } from '../helper/status';
import { $pretty } from './rows/pretty';
import { $window, $tabbedWindow } from './window';
import { $form, $formRow } from './rows/form';

const $select = ({ values, selected, onChange }) => html`
	<select
		@change=${(ev) => {
			onChange(ev.target.value);
		}}
	>
		${Object.entries(values).map(
			([key, val]) =>
				html`<option value=${key} selected=${key === selected}>
					${val}
				</option>`
		)}
	</select>
`;

const $colorRow = (agent: Agent) =>
	$formRow({
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
	if (agent.type !== AgentStateType.MOVER) {
		return $form([$colorRow(agent)]);
	}

	const tires = {
		5: 'Nice n chill',
		10: 'Balanced',
		20: 'Bananas',
	};

	const deliveries = Object.fromEntries(
		Object.entries(gameState.agents).map(([id, agent]) => [id, agent.name])
	);

	return $form([
		$formRow({
			label: 'Deliver to',
			control: $select({
				values: deliveries,
				selected: agent.to[0],
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
		$formRow({
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
		$formRow({
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
		useGameState((state) => findAgent(agentId, state).emoji),
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
					useGameState((state) => $pretty(findAgent(agentId, state))),
				],
			},
			{
				emoji: '🔧',
				name: 'System',
				contents: [useGameState((state) => $pretty(findAgent(agentId, state)))],
			},
		]
	);

export { $agentWindow };
