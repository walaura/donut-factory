import { css } from '../../helper/style';
import { h } from 'preact';
import { Emoji } from '../emoji';
import { DietButton, RevealButton } from '../button';
import { useWindowHandles } from '../../hook/use-taskbar/handles';
import { RouteIdentifiers } from '../../helper/route';
import { Padding } from '../primitives/padding';

const styles = {
	icon: css`
		display: grid;
		align-items: center;
		justify-content: center;
		transform: scale(1.25);
		min-width: var(--pressable);
	`,
	base: css`
		font-weight: var(--font-bold);
		transform: lowercase;
		color: var(--text-title);
		padding: var(--space-v) 0;
		min-height: var(--pressable);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 2px;
		> * {
			flex: 0 0 1;
		}
	`,
	close: css`
		min-width: calc(var(--pressable) * 0.75);
		min-height: calc(var(--pressable) * 0.75);
		padding: 0;
		& svg {
			transform: scale(2) rotate(45deg);
			fill: currentColor;
		}
		& div {
			display: grid;
			align-items: center;
			justify-content: center;
		}
	`,
};

export const ModalHeader = ({ emoji, name }: RouteIdentifiers) => {
	let { dragHandle, closeHandle } = useWindowHandles();

	return (
		<header className={styles.base} onMouseDown={dragHandle}>
			{emoji && (
				<div className={styles.icon}>
					<Emoji emoji={emoji} />
				</div>
			)}
			<div
				className={css`
					transform: translate(0, 0.1em);
					flex: 1 1 0;
				`}>
				<Padding size="small">{name}</Padding>
			</div>
			{closeHandle && (
				<div className={styles.close}>
					<RevealButton onClick={closeHandle}>
						<div className={styles.close}>
							<svg width="5px" height="5px" xmlns="http://www.w3.org/2000/svg">
								<rect x="0" y="2" width="5" height="1"></rect>
								<rect x="2" y="0" width="1" height="5"></rect>
							</svg>
						</div>
					</RevealButton>
				</div>
			)}
		</header>
	);
};
