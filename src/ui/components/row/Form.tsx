import { h } from 'preact';
import { Accesory } from '../primitives/Accesory';
import { Heading } from '../type';

export const Form = ({ children, label }) => (
	<Accesory accesory={children}>
		<Heading>{label}</Heading>
	</Accesory>
);
