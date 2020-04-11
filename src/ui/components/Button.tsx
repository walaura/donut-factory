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
		&:focus:not(.focus-visible) {
			outline: 0;
		}
		&:focus-visible {
			box-shadow: 0 0 0 3px var(--main);
		}
	`,
	animation: css`
		transition: all 0.15s ease-out;
		&:hover {
			transform: scale(1.01);
		}
		&:active {
			transition: all 0.075s ease-out;
			transform: scale(1.05) translateY(1%);
			box-shadow: var(--shadow-1);
		}
	`,
	visible: css`
		padding: calc(var(--space-h) / 2);
		background: var(--bg-light);
		box-shadow: var(--shadow-2);
		margin: 0;
	`,
	reveal: css`
		margin: calc(var(--space-v) / -2) calc(var(--space-h) / -2);
		padding: calc(var(--space-v) / -2) calc(var(--space-h) / 2);
		position: relative;
		width: 100%;
		box-sizing: content-box;
		& > div:last-child {
			z-index: 4;
			will-change: transform;
		}
		& > div:first-child {
			opacity: 0;
			z-index: 2;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}
		&:hover > div:first-child {
			opacity: 0.25;
		}
		&:active > div:first-child {
			opacity: 0.6;
		}
	`,
};
export const VisibleButton = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
	<button
		{...props}
		className={[styles.shared, styles.animation, styles.visible].join(' ')}
	/>
);

export const RevealButton = ({
	isActive = false,
	...props
}: JSX.HTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) => (
	<button
		{...props}
		class={[styles.shared, styles.reveal, styles.animation].join(' ')}>
		<div class={[styles.shared, styles.visible].join(' ')}></div>
		<div
			class={css`
				pointer-events: none;
			`}>
			{props.children}
		</div>
	</button>
);
