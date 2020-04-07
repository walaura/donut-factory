import { addAgent } from './../../loop/loop';
import { GameState } from './../../helper/defs';
import { ID, Agent } from '../../helper/defs';
import { findAgent } from '../../loop/loop';
import { useGameState } from '../helper/gameState';
import { $table, $tableRow } from './rows/table';
import { $window, addDynamicWindow } from './window';
import { getAgentStatus } from '../helper/status';
import { $agentWindow } from './agentWindow';
import { html } from 'lit-html';
import { MkConsumer } from '../../agent/consumer';
import { xy } from '../../helper/xy';

let fairypos = { x: 45, y: 15 };

const $row = (agent: Agent, state: GameState) =>
	$tableRow({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: () => {
			addDynamicWindow($agentWindow(agent.id));
		},
	});

const $agentsWindow = () =>
	$window('🌈', 'All agents', [
		$table(
			useGameState((state) =>
				Object.values(state.agents).map((ag) => $row(ag, state))
			)
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
