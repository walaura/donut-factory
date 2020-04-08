import { html } from 'lit-html';
import { Entity } from '../../helper/defs';

export const $heading = (txt) => html`
	<style>
		x-heading {
			font-weight: var(--font-bold);
			color: var(--text-bold);
		}
	</style>
	<x-heading><h3>${txt}</h3></x-heading>
`;

export const $t = (entity: Entity | null) =>
	entity ? `${entity.emoji}${entity.name}` : 'Unknown';
