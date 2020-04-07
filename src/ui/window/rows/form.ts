import { html } from 'lit-html';
import { $heading } from '../components/type';

const $form = ({ label, control = null }: { label: any; control: any }) => html`
	<style>
		x-form {
			display: grid;
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 1fr;
			grid-gap: var(--space-h);
		}
		x-form h3 {
			font-weight: var(--font-bold);
			color: var(--text-bold);
		}
	</style>

	<x-form>
		${$heading(label)} ${control}
	</x-form>
`;

export { $form };
