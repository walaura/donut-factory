import { html } from 'lit-html';
import {
	CallableWindowRoute,
	CallableWindowTypes,
	WindowCallbacks,
} from '../$window/$window';
import { MkConsumer } from '../../entity/consumer';
import { MkMover } from '../../entity/vehicle';
import { addEntity } from '../../game/entities';
import { Entity, GameState } from '../../helper/defs';
import { $tabset } from '../components/$tabset';
import { $infoBig } from '../components/rows/info';
import { getAgentStatus } from '../helper/status';

let fairypos = { x: 45, y: 15 };

const $row = (
	agent: Entity,
	state: GameState,
	navigator: CallableWindowRoute,
	{
		onNavigate,
		selectedNavigator,
	}: Pick<WindowCallbacks, 'onNavigate' | 'selectedNavigator'>
) => {
	return $infoBig({
		icon: agent.emoji,
		heading: agent.name,
		selected: selectedNavigator?.path[1] === navigator.path[1],
		accesories: [getAgentStatus(agent.id, state)],
		onClick: (ev) => onNavigate(ev)(navigator),
	});
};

const allEntities = (): CallableWindowRoute => ({
	emoji: '🌈',
	path: ['all-entities'],
	name: 'All game entities',
	type: CallableWindowTypes.MasterDetail,
	render: ({ onNavigate, selectedNavigator }) =>
		$tabset({
			sideways: true,
			tabs: [
				{
					name: 'useful agents',
					emoji: '🚚',
				},
				{
					name: 'All other agents',
					emoji: '📋',
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
		}),
});

export { allEntities };
