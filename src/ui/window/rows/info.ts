import { html } from 'lit-html';
import { $emoji } from '../components/emoji';
import { $heading } from '../components/type';

interface Info {
	body: any;
	accesory?: any;
}
const $infoSmall = ({ label, info = [] }: { label: any; info: Info[] }) => html`
	<xi-row>
		${$heading(label)}
		${info.map(
			({ body, accesory }) => html`
				<xir-info>
					<xiri-body>${body}</xiri-body>
					${accesory && html`<xiri-accesory>${accesory}</xiri-accesory>`}
				</xir-info>
			`
		)}
	</xi-row>
`;

const $infoBig = ({
	icon,
	onClick = null,
	centered = false,
	heading,
	accesories,
}: {
	icon: any;
	onClick?: (() => void) | null;
	centered?: boolean;
	heading: any;
	accesories: any[];
}) => html`
	<style>
		table-row {
			display: flex;
		}
		tr-icon {
			width: calc(var(--pressable) - var(--space-h));
			margin-top: 0;
			display: grid;
			justify-content: flex-end;
			padding-right: var(--space-h);
			flex: 0 0 auto;
			line-height: 1;
		}
		tr-body > *:not(style) {
			display: block;
			margin-bottom: 0.25em;
		}
	</style>
	<table-row data-centered=${centered} @click=${onClick}>
		<tr-icon>${$emoji(icon)}</tr-icon>
		<tr-body>
			${$heading(heading)} ${accesories.map((a) => html`<p>${a}</p>`)}
		</tr-body>
	</table-row>
`;

export { $infoBig, $infoSmall };
