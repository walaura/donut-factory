import {
	numberWithCommas,
	longDate,
	clock,
	shortNumber,
} from '../helper/format';
import { LedgerRecord, ID, AgentStateType } from '../../helper/defs';
import { $window } from './window';
import { GameState } from '../../helper/defs';
import { $pretty } from './rows/pretty';
import { html, directive } from 'lit-html';
import { useGameState, UIStatePriority } from '../helper/state';
import { findAgent, mutateAgent } from '../../loop/loop';
import { MoverAgent } from '../../agent/mover';

const currency = '$';

const $info = (agentId: ID, gameState: GameState) => {
	let txt = '';
	const agent = findAgent(agentId, gameState);
	if (agent.type !== AgentStateType.MOVER) {
		return;
	}
	if (agent.path.length === 0) {
		txt = `Stuck or loading/unloading`;
	}
	if (agent.held <= 0) {
		txt = `On their way to ${findAgent(agent.from[0], gameState).emoji}`;
	} else {
		txt = `Delivering ${shortNumber(agent.held)} boxes to
		${findAgent(agent.to[0], gameState).emoji}`;
	}

	return html`${txt}
	<hr />
		Tires
		<select @change=${(ev) => {
			const value = parseInt(ev.target.value, 10) / 10;
			mutateAgent<MoverAgent>(
				agent.id,
				(prev, _, [offroadSpeed]) => ({
					...prev,
					offroadSpeed,
				}),
				[value]
			);
		}}>
			<option value="5">Road lover</option>
			<option value="10">Balanced</option>
			<option value="20">Bananas</option>
		</select>
		</button>
		<hr />
		This vehicle wants to ${agent.preferenceForRoads} offroad
		<button
			@click="${() => {
				mutateAgent<MoverAgent>(agent.id, (prev) => ({
					...prev,
					preferenceForRoads: prev.preferenceForRoads - 5,
				}));
			}}"
		>
			more
		</button> `;
};

const $agentWindow = (agentId: ID) =>
	$window(
		useGameState((state) => findAgent(agentId, state).emoji),
		'Agent info',
		[
			useGameState((state) => $info(agentId, state)),
			useGameState((state) => $pretty(findAgent(agentId, state))),
		]
	);

export { $agentWindow };
