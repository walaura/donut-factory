import { css } from '../../helper/style';
import { h } from 'preact';
import { Emoji } from '../Emoji';
import { DietButton } from '../Button';
import { useOverlayHandles } from '../../hook/use-overlays';

const styles = {
	icon: css`
		display: grid;
		align-items: center;
		justify-content: center;
		transform: scale(1.25);
	`,
	base: css`
		font-weight: var(--font-bold);
		transform: lowercase;
		color: var(--text-title);
		padding: var(--space-v) 0;
		min-height: var(--pressable);
		display: grid;
		border-radius: var(--radius-small);
		grid-template-columns: calc(var(--pressable)) 1fr calc(var(--pressable));
		align-items: center;
		justify-content: center;
		margin-bottom: 2px;
	`,
	close: css`
		transform: scale(2) rotate(45deg);
		display: grid;
		align-items: center;
		justify-content: center;
		fill: currentColor;
	`,
};

export const ModalHeader = ({
	emoji,
	title,
}: {
	emoji: string;
	title: string;
}) => {
	let { dragHandle, closeHandle } = useOverlayHandles();

	return (
		<header className={styles.base} onMouseDown={dragHandle}>
			<div className={styles.icon}>
				<Emoji emoji={emoji} />
			</div>
			<div
				className={css`
					transform: translate(0, 0.1em);
				`}>
				{title}
			</div>
			{closeHandle && (
				<div className={styles.close}>
					<DietButton onClick={closeHandle}>
						<svg width="5px" height="5px" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="2" width="5" height="1"></rect>
							<rect x="2" y="0" width="1" height="5"></rect>
						</svg>
					</DietButton>
				</div>
			)}
		</header>
	);
};
