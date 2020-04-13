import { h } from 'preact';
import { css } from '../helper/style';

const styles = {
	overlay: css`
		width: 1em;
		height: 1em;
		& > * {
			position: absolute;
			top: 0;
			left: 0;
		}
	`,
	base: css`
		display: grid;
		width: 1em;
		height: 1em;
		align-items: center;
		justify-content: center;
		line-height: 1em;
		vertical-align: 1em;
		transform: scale(1.33);

		& > * {
			font-size: 1em;
			display: inline;
			line-height: 1em;
			vertical-align: 1em;
			transform: translate(10%, 5%);
		}
	`,
};

export const Emoji = ({ emoji }: { emoji: string }) => {
	return (
		<div class={styles.base} data-cssid="emoji">
			<div>{emoji}</div>
		</div>
	);
};
export const EmojiOverlay = ({ emojis }: { emojis: string[] }) => {
	return (
		<div class={styles.overlay} data-cssid="emoji">
			{emojis.map((emoji) => (
				<Emoji emoji={emoji} />
			))}
		</div>
	);
};
