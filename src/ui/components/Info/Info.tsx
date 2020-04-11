import { h, JSX } from 'preact';
import { css } from '../../helper/style';
import { Emoji } from '../Emoji';
import { Heading } from '../type';

const styles = {
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

const Info = ({
	icon,
	heading,
	children,
}: {
	icon: string;
	centered?: boolean;
	heading: JSX.Element | string;
	children: (JSX.Element | string)[];
}) => (
	<div class={styles.flex}>
		<div class={styles.icon}>
			<Emoji emoji={icon} />
		</div>
		<div class={styles.body}>
			<Heading>{heading}</Heading>
			{children.map((a) => (
				<p>{a}</p>
			))}
		</div>
	</div>
);

export { Info };
