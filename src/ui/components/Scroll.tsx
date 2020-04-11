import { h } from 'preact';
import { css } from '../helper/style';

const base = css`
	width: 100%;
	height: 100%;
	overflow: scroll;
`;

const Scroll = ({ children }: { children: preact.ComponentChildren }) => {
	return <div class={base}>{children}</div>;
};

export { Scroll };
