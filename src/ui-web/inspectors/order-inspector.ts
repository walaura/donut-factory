import { $form } from '../components/rows/form';
import { mutateAgent } from '../../loop/loop';
import { Vehicle } from '../../agent/vehicle';

const form = [
	$form({
		label: 'Delivers',
		control: $select({
			values: deliveries,
			selected: agent.transports[0] ?? 'unknown',
			onChange: (transports) => {
				mutateAgent<Vehicle>(
					agent.id,
					(prev, _, [transports]) => ({
						...prev,
						transports: [transports],
					}),
					[transports]
				);
			},
		}),
	}),
	$form({
		label: 'Deliver from',
		control: $select({
			values: deliveries,
			selected: agent.from[0] ?? 'unknown',
			onChange: (from) => {
				mutateAgent<Vehicle>(
					agent.id,
					(prev, _, [from]) => ({
						...prev,
						from: [from],
					}),
					[from]
				);
			},
		}),
	}),
	$form({
		label: 'Deliver to',
		control: $select({
			values: deliveries,
			selected: agent.to[0] ?? '',
			onChange: (to) => {
				mutateAgent<Vehicle>(
					agent.id,
					(prev, _, [to]) => ({
						...prev,
						to: [to],
					}),
					[to]
				);
			},
		}),
	}),
];
