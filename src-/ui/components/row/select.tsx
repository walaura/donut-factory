import { h } from 'preact';

export const Select = ({
	values,
	selected,
	onChange,
}: {
	values: { [key in string | number]: string | number };
	selected: string | number;
	onChange: (change: string) => void;
}) => (
	<select
		onChange={(ev) => {
			//@ts-ignore
			onChange(ev?.target?.value);
		}}>
		{Object.entries(values).map(([key, val]) => (
			<option value={key} selected={key.toString() === selected.toString()}>
				{val}
			</option>
		))}
	</select>
);
