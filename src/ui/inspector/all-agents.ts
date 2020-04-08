import { html } from 'lit-html';
import { generateWindowEv } from '../$window/$window';
import { MkConsumer } from '../../agent/consumer';
import { MkMover } from '../../agent/mover';
import { Entity, GameState, PlaceableEntity } from '../../helper/defs';
import { addAgent } from '../../loop/loop';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { getAgentStatus } from '../helper/status';
import { useGameState } from '../helper/useGameState';
import { TabbedWindowProps } from './../$window/$window';
import { agentInspector } from './agent-inspector';

let fairypos = { x: 45, y: 15 };

const $row = (agent: Entity, state: GameState) =>
	$infoBig({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: (ev) => generateWindowEv(ev)(agentInspector(agent.id)),
	});

const isPlaceable = (entity: Entity): entity is Entity & PlaceableEntity => {
	return 'placeable' in entity;
};

const allAgents = (): TabbedWindowProps => ({
	emoji: '🌈',
	title: 'All agents',
	tabs: [
		{
			name: 'useful agents',
			emoji: '🚚',
			contents: [
				useGameState((state) =>
					$rows(
						Object.values(state.entities)
							.filter(isPlaceable)
							.map((ag) => $row(ag, state))
					)
				),
			],
		},
		{
			name: 'All other agents',
			emoji: '📋',
			contents: [
				useGameState((state) =>
					$rows(
						Object.values(state.entities)
							.filter((a) => !isPlaceable(a))
							.map((ag) => $row(ag, state))
					)
				),
			],
		},
		{
			name: 'Build/Hire',
			emoji: '⛑',
			contents: [
				html`<button
					@click=${() => {
						addAgent(MkConsumer(fairypos));
						fairypos.x += 5;
						fairypos.y += 5;
					}}
				>
					add fairy
				</button>`,
				html`<button
					@click=${() => {
						addAgent(MkMover());
					}}
				>
					add truck
				</button>`,
			],
		},
	],
});

export { allAgents };
