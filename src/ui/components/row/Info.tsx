import { h, JSX } from 'preact';
import { css } from '../../helper/style';
import { Emoji } from '../emoji';
import { Heading } from '../type';

const styles = {
	flex: (center: boolean) => css`
		display: flex;
		width: 100%;
		min-height: calc(var(--pressable) * 0.75);
		align-items: ${center ? 'center' : 'flex-start'};
	`,
	icon: css`
		width: calc(var(--pressable) - var(--space-h));
		margin-top: 0;
		display: grid;
		justify-content: flex-end;
		padding-right: var(--space-h);
		transform: translateX(-10%) translateY(20%);
		flex: 0 0 auto;
		line-height: 1;
	`,
	body: css`
		width: 100%;
		padding: 0.25em 0;

		& > *:not(style):not(:last-child) {
			display: block;
			margin-bottom: 0.1em;
		}
	`,
};

const Info = ({
	icon,
	heading,
	children,
	center = false,
}: {
	icon?: string;
	center?: boolean;
	heading?: JSX.Element | string | null;
	children?: preact.ComponentChildren;
}) => {
	if (!(children instanceof Array)) {
		children = [children];
	}

	return (
		<div class={styles.flex(center)}>
			{icon && (
				<div class={styles.icon}>
					<Emoji emoji={icon} />
				</div>
			)}
			<div class={styles.body}>
				{heading && <Heading>{heading}</Heading>}
				{'map' in children && children.map((a) => <p>{a}</p>)}
			</div>
		</div>
	);
};

export { Info };
