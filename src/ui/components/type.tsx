import { h, JSX } from 'preact';
import { Entity } from '../../helper/defs';
import { css } from '../helper/style';

export const Heading = ({ children }: { children: JSX.Element | string }) => (
	<h3
		class={css`
			font-weight: var(--font-bold);
			color: var(--text-bold);
		`}>
		{children}
	</h3>
);

export const $t = (entity: Pick<Entity, 'name' | 'emoji'> | null) =>
	entity ? `${entity.emoji}${entity.name}` : 'Unknown';
