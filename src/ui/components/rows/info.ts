import { html } from 'lit-html';
import { $padding } from '../$padding';
import { css } from '../../helper/style';
import { $emoji } from '../$emoji';
import { $heading } from '../type';

interface Info {
	body: any;
	accesory?: any;
}
const $infoSmall = ({
	label,
	onClick = null,
	info = [],
}: {
	label: any;
	onClick?: ((any) => void) | null;
	info: Info[];
}) => html`
	<xi-row @click=${onClick}>
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

const styles = {
	base: css`
		&[data-selected] {
			background-color: rgba(255, 255, 255, 0.25);
			box-shadow: var(--shadow-1);
		}
		transition: 0.1s ease-in-out;
		&:active {
			transform: scale(1.05);
		}
	`,
	flex: css`
		display: flex;
	`,
	icon: css`
		width: 2em;
		margin-top: 0;
		display: grid;
		justify-content: flex-end;
		padding-right: var(--space-h);
		flex: 0 0 auto;
		line-height: 1;
	`,
	body: css`
		& > *:not(style):not(:last-child) {
			display: block;
			margin-bottom: 0.25em;
		}
	`,
};

const $infoBig = ({
	icon,
	onClick = null,
	centered = false,
	selected = false,
	heading,
	accesories,
}: {
	icon: any;
	onClick?: ((any) => void) | null;
	centered?: boolean;
	selected?: boolean;
	heading: any;
	accesories: any[];
}) =>
	$padding(
		$padding(
			html`
			<div
				class=${styles.base}
				data-centered=${centered}
				?data-selected=${selected}
				@click=${onClick}
			>
				${$padding(
					html`<div class=${styles.flex}>
						<div class=${styles.icon}>${$emoji(icon)}</div>
						<div class=${styles.body}>
							${$heading(heading)} ${accesories.map((a) => html`<p>${a}</p>`)}
						</div>
					</div>`,
					{ size: 'small' }
				)}
			</div></div>
		`,
			{ type: 'antiPadding' }
		),
		{ size: 'small' }
	);

export { $infoBig, $infoSmall };
