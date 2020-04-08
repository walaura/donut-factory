import { ListWindowProps } from './../$window/$window';
import { html } from 'lit-html';
import { MkConsumer } from '../../agent/consumer';
import { MkMover } from '../../agent/mover';
import { Agent, GameState } from '../../helper/defs';
import { addAgent } from '../../loop/loop';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { getAgentStatus } from '../helper/status';
import { useGameState } from '../helper/useGameState';
import { agentInspector } from './agent-inspector';
import { generateWindowEv } from '../$window/$window';

let fairypos = { x: 45, y: 15 };

const $row = (agent: Agent, state: GameState) =>
	$infoBig({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: (ev) => generateWindowEv(ev)(agentInspector(agent.id)),
	});

const allAgents = (): ListWindowProps => ({
	emoji: '🌈',
	title: 'All agents',
	list: [
		useGameState((state) =>
			$rows(Object.values(state.agents).map((ag) => $row(ag, state)))
		),
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
});

export { allAgents };
