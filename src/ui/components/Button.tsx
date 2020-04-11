import { h, JSX } from 'preact';
import { css } from '../helper/style';

const dietStyles = css`
	display: contents;
`;
export const DietButton = (props) => (
	<button {...props} className={[dietStyles, props.className].join(' ')} />
);

const styles = {
	shared: css`
		text-align: left;
		border-radius: var(--radius-small);
		overflow: hidden;
		transition: 0.1s ease-out;
		&:active {
			transform: scale(1.1);
		}
	`,
	visible: css`
		padding: calc(var(--space-h) / 2);
		background: var(--bg-light);
		box-shadow: var(--shadow-2);
		margin: 0;
	`,
	reveal: css`
		margin: calc(var(--space-h) / -2);
		padding: calc(var(--space-h) / 2);
		position: relative;
		& > * {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}
		& > :last-child {
			z-index: 4;
			will-change: transform;
		}
		& > :first-child {
			opacity: 0;
			z-index: 2;
		}
		&:hover > :first-child {
			opacity: 0.1;
		}
		&:active > :first-child {
			opacity: 0.25;
		}
	`,
};
export const VisibleButton = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
	<button {...props} className={[styles.shared, styles.visible].join(' ')} />
);

export const RevealButton = ({
	isActive = false,
	...props
}: JSX.HTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) => (
	<div className={styles.reveal}>
		<div
			className={[
				styles.shared,
				styles.visible,
				css`
					pointer-events: none;
				`,
			].join(' ')}></div>
		<DietButton {...props} />
	</div>
);
