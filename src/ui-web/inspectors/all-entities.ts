import { entityHasXY } from '../../helper/defs';
import { html } from 'lit-html';
import { generateWindowEv } from '../$window';
import { MkMover } from '../../entity/vehicle';
import { Entity, GameState, WithXY } from '../../helper/defs';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { getAgentStatus } from '../helper/status';
import { useGameState } from '../helper/useGameState';
import { TabbedWindowProps } from '../$window';
import { agentInspector } from './entity-inspector';
import { MkConsumer } from '../../entity/consumer';
import { addEntity } from '../../game/entities';

let fairypos = { x: 45, y: 15 };

const $row = (agent: Entity, state: GameState) =>
	$infoBig({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: (ev) => generateWindowEv(ev)(agentInspector(agent.id)),
	});

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
							.filter(entityHasXY)
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
							.filter((a) => !entityHasXY(a))
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
						addEntity(MkConsumer(fairypos));
						fairypos.x += 5;
						fairypos.y += 5;
					}}
				>
					add fairy
				</button>`,
				html`<button
					@click=${() => {
						addEntity(MkMover());
					}}
				>
					add truck
				</button>`,
			],
		},
	],
});

export { allAgents };
