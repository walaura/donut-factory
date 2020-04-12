import { css } from './helper/style';
import { h } from 'preact';

const styles = css`
	font-weight: bold;
	opacity: 0.66;
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: 20em;
	text-align: center;
`;

export const CompatError = () => {
	if ('OffscreenCanvas' in self) {
		return null;
	}
	return (
		<div class={styles}>
			hey soz :( your browser wont let you see the game board (try
			firefox/chrome) but you can still play from the ui???
		</div>
	);
};
