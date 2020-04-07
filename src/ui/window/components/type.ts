import { html } from 'lit-html';

export const $heading = (txt) => html`
	<style>
		x-heading {
			font-weight: var(--font-bold);
			color: var(--text-bold);
		}
	</style>
	<x-heading><h3>${txt}</h3></x-heading>
`;
