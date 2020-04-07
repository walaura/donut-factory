import { html } from 'lit-html';
import { MkConsumer } from '../../agent/consumer';
import { Agent } from '../../helper/defs';
import { useGameState } from '../helper/gameState';
import { getAgentStatus } from '../helper/status';
import { GameState } from './../../helper/defs';
import { addAgent } from './../../loop/loop';
import { $agentWindow } from './agentWindow';
import { $infoBig } from './rows/info';
import { $window, addDynamicWindow } from './window';
import { $rows } from './rows/row';

let fairypos = { x: 45, y: 15 };

const $row = (agent: Agent, state: GameState) =>
	$infoBig({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: () => {
			addDynamicWindow($agentWindow(agent.id));
		},
	});

const $agentsWindow = () =>
	$window('🌈', 'All agents', [
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
	]);

export { $agentsWindow };
