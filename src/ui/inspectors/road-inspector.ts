import { Road, RoadEnd } from '../../entity/road';
import { GameState } from '../../helper/defs';
import { $form } from '../components/rows/form';
import { html } from 'lit-html';
import { mergeEntity } from '../../game/entities';
import { $button } from '../components/$button';
import { dispatchToCanvas } from '../../global/dispatch';
import { $buttonGrid } from '../components/form/$buttonGrid';

const $roadInfo = (road: Road, state: GameState) => [
	$form({
		label: 'Start',
		control: html`
			<div>
				<input
					@change=${(ev) => {
						let x = parseInt(ev.target.value);
						mergeEntity<Road>(road.id, {
							start: {
								x,
							},
						});
					}}
					type="number"
					step="1"
					value=${road.start.x}
				/>
				<input
					@change=${(ev) => {
						mergeEntity<Road>(road.id, {
							start: {
								y: parseInt(ev.target.value),
							},
						});
					}}
					type="number"
					step="1"
					value=${road.start.y}
				/>
			</div>
		`,
	}),
	$form({
		label: 'End',
		control: html`
			<div>
				${$buttonGrid([
					html` <input
							@change=${(ev) => {
								let x = parseInt(ev.target.value);
								mergeEntity<Road>(road.id, {
									end: {
										x,
									},
								});
							}}
							type="number"
							step="1"
							value=${road.end.x}
						/>
						<input
							@change=${(ev) => {
								mergeEntity<Road>(road.id, {
									end: {
										y: parseInt(ev.target.value),
									},
								});
							}}
							type="number"
							step="1"
							value=${road.end.y}
						/>`,
					$button('Change', {
						onClick: () => {
							dispatchToCanvas({
								type: 'set-edit-mode-target',
								to: {
									entityId: road.id,
									roadEnd: RoadEnd.end,
								},
							});
						},
					}),
				])}
			</div>
		`,
	}),
];
export { $roadInfo };
