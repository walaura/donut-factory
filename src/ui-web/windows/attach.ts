import { html } from 'lit-html';
import { Entity, GameState, ID } from '../../helper/defs';
import { $infoBig } from '../components/rows/info';
import { $insetRows } from '../components/rows/row';
import { getAgentStatus } from '../helper/status';
import { useGameState } from '../helper/useGameState';
import { ListWindowProps, WindowCallbacks } from './../$window';

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
}) => ({ onClose }: WindowCallbacks): ListWindowProps => ({
	emoji: '➕',
	title: 'Attach entity',
	modal: true,
	list: [
		html`Pick one`,
		useGameState((state) =>
			$insetRows(
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
					)
			)
		),
	],
});

export { attachWindow };
