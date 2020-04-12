import { ID, EntityType } from '../../../helper/defs';
import { JSX, h } from 'preact';
import {
	useLastKnownEntityState,
	UIStatePriority,
} from '../../hook/use-game-state';
import { Form } from '../../components/row/form';
import { Select } from '../../components/row/select';
import { mergeEntity } from '../../../game/entities';
import { Vehicle } from '../../../entity/vehicle';
import { MiniGrid } from '../../components/primitives/mini-grid';
import { VisibleButton } from '../../components/button';
import { dispatchToGame } from '../../../global/dispatch';
import { RowList } from '../../components/list/row-list';

export const EntitySettingsTab = ({ entityId }: { entityId: ID }) => {
	let rows: (string | JSX.Element)[] = [];
	const entity = useLastKnownEntityState(entityId, UIStatePriority.Snail);

	if (entity && entity.type === EntityType.Vehicle) {
		const tires = {
			5: 'Nice n chill',
			10: 'Balanced',
			20: 'Bananas',
		};

		rows.push(
			...[
				<Form label={'Tires'}>
					<Select
						onChange={(val) => {
							const offroadSpeed = parseInt(val, 10) / 10;
							mergeEntity<Vehicle>(entity.id, {
								offroadSpeed,
							});
						}}
						values={tires}
						selected={entity.offroadSpeed * 10}
					/>
				</Form>,
				<Form
					label={`This vehicle likes roads a ${entity.preferenceForRoads}/10`}>
					<input
						onChange={(ev) => {
							//@ts-ignore
							const preferenceForRoads = parseInt(ev?.target?.value, 10);
							mergeEntity<Vehicle>(entity.id, {
								preferenceForRoads,
							});
						}}
						type="range"
						min="0"
						max="10"
						value={entity.preferenceForRoads}
					/>
				</Form>,
			]
		);
	}

	rows.push(
		<MiniGrid>
			<VisibleButton
				onClick={() => {
					dispatchToGame({
						type: 'delete-entity',
						entityId,
					});
				}}>
				Delete entity
			</VisibleButton>
		</MiniGrid>
	);
	return <RowList padding="normal">{rows}</RowList>;
};
