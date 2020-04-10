import { html } from 'lit-html';
import { Entity, GameState, ID } from '../../helper/defs';
import { $infoBig } from '../components/rows/info';
import { $rows } from '../components/rows/row';
import { getAgentStatus } from '../helper/status';
import { useGameState } from '../helper/useGameState';
import { CallableWindowRoute, WindowCallbacks } from '../$window/$window';
import { $wash } from '../components/$wash';
import { $flex } from '../components/$flex';
import { $scroll } from '../components/$scroll';
import { $padding } from '../components/$padding';

const $row = (agent: Entity, onAttach: any, state: GameState) =>
	$infoBig({
		icon: agent.emoji,
		heading: agent.name,
		accesories: [getAgentStatus(agent.id, state)],
		onClick: (ev) => {
			onAttach(agent.id);
		},
	});

const attachWindow = ({
	onAttach,
	filter,
}: {
	onAttach: (id: ID) => void;
	filter: (entity: Entity) => boolean;
}): CallableWindowRoute => ({
	emoji: '➕',
	path: ['ONEOFF'],
	name: 'Attach entity',
	modal: true,
	render: ({ onClose }: WindowCallbacks) =>
		$flex(
			[
				html`Pick one`,
				useGameState((state) =>
					$wash(
						$scroll(
							$rows(
								Object.values(state.entities)
									.filter(filter)
									.map((ag) =>
										$row(
											ag,
											(id) => {
												onAttach(id);
												onClose();
											},
											state
										)
									),
								{ breakout: false }
							)
						)
					)
				),
			],
			{ distribute: ['squish', 'grow'] }
		),
});

export { attachWindow };
