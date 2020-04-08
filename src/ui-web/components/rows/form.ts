import { html } from 'lit-html';
import { css } from '../../../ui-web/helper/style';
import { $heading } from '../../../ui-web/components/type';

const styles = css`
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 1fr 1fr;
	grid-gap: var(--space-h);
`;

const $form = ({ label, control = null }: { label: any; control: any }) => html`
	<x-form class=${styles}>
		${$heading(label)} ${control}
	</x-form>
`;

export { $form };
