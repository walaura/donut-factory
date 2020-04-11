import { h } from 'preact';
import { css } from '../../helper/style';

const base = css`
	width: 100%;
	height: 100%;
	overflow: scroll;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	contain: strict;
`;

const Scroll = ({ children }: { children: preact.ComponentChildren }) => {
	return <div class={base}>{children}</div>;
};

export { Scroll };
