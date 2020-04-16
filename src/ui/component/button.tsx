import { h, JSX } from 'preact';
import { css } from '../helper/style';
import { Emoji, EmojiOverlay } from './emoji';
import { useLayoutHints } from '../hook/use-layout-hint';

const dietStyles = css`
	display: contents;
	&:focus:not(.focus-visible) {
		outline: 0;
	}
	&:focus-visible {
		box-shadow: 0 0 0 3px var(--main);
	}
`;
export const DietButton = ({
	onClick,
	...props
}: {
	children;
	onClick?: (ev: MouseEvent) => void;
	className?: string;
}) =>
	onClick ? (
		<button
			onMouseDown={(ev) => {
				if (self.memory.id === 'MAIN') {
					self.memory.ui.boop();
				}
				onClick(ev);
			}}
			{...props}
			className={[dietStyles, props.className].join(' ')}
		/>
	) : (
		props.children
	);

const styles = {
	shared: css`
		text-align: left;
		display: flex;
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
		transition: all 0.05s ease-out;
		transform: scale(1.000001);
		&:hover {
			box-shadow: var(--shadow-2);
			filter: brightness(1.05);
		}
		&:active {
			transform: scale(1.025);
			box-shadow: var(--shadow-1);
		}
	`,
	visible: css`
		color: var(--text-button);
		padding: calc(var(--space-h) / 2);
		background: var(--bg-button);
		box-shadow: var(--shadow-2);
		font-weight: var(--font-bold);
		margin: 0;
	`,
	reveal: css`
		margin: calc(var(--space-v) / -2) calc(var(--space-h) / -2);
		padding: calc(var(--space-v) / -2) calc(var(--space-h) / 2);
		position: relative;
		width: 100%;
		box-sizing: content-box;
		display: flex;
		align-items: stretch;
		justify-content: stretch;
		--bg-button: var(--bg-counter-wash);
		& > div:last-child {
			z-index: 4;
			will-change: transform;
			width: 100%;
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
			opacity: 0.1;
		}
		&:active > div:first-child {
			opacity: 0.2;
		}
	`,
};

const visibleButtonLayoutStyles = {
	long: css`
		display: grid;
		grid-template-columns: var(--pressable) 1fr;
		grid-template-rows: 1fr;
		align-items: center;
		justify-items: center;
		grid-gap: var(--space-h);
		height: 100%;
	`,
	square: css`
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content min-content;
		align-items: flex-start;
		justify-content: space-between;
		justify-items: space-between;
		grid-gap: var(--space-v);
	`,
};
type VisibleButtonProps = {
	children;
	onClick: (ev: MouseEvent) => void;
} & (
	| {
			icon: string;
	  }
	| {
			state: boolean;
	  }
	| {}
);

export const VisibleButton = ({ children, ...props }: VisibleButtonProps) => {
	const { horizontal } = useLayoutHints();
	let layout = horizontal === 'narrower' ? 'square' : 'long';
	return (
		<DietButton onClick={props.onClick}>
			<div
				className={[styles.shared, styles.animation, styles.visible].join(' ')}>
				{'icon' in props ? (
					<div class={visibleButtonLayoutStyles[layout]}>
						<Emoji emoji={props.icon} />
						<span>{children}</span>
					</div>
				) : 'state' in props ? (
					<div class={visibleButtonLayoutStyles[layout]}>
						<EmojiOverlay emojis={!props.state ? ['✅', '🚫'] : ['✅']} />
						<span>{children}</span>
					</div>
				) : (
					children
				)}
			</div>
		</DietButton>
	);
};

export const RevealButton = ({
	isActive = false,
	...props
}: JSX.HTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) => (
	<DietButton onClick={props.onClick}>
		<div class={[styles.shared, styles.reveal, styles.animation].join(' ')}>
			<div class={[styles.shared, styles.visible].join(' ')}></div>
			<div
				class={css`
					pointer-events: none;
				`}>
				{props.children}
			</div>
		</div>
	</DietButton>
);
