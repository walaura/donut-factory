import { h } from 'preact';
import { css } from '../../helper/style';

export const Accesory = ({ children, accesory }) => (
	<div
		class={css`
			display: grid;
			grid-template-columns: 1fr 1fr;
			width: 100%;
			grid-gap: var(--space-min);
		`}>
		<span>{children}</span>
		<small>{accesory}</small>
	</div>
);
