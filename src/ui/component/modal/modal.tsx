import { h } from 'preact';
import { RouteIdentifiers } from '../../helper/route.defs.ts';
import { css, keyframes } from '../../helper/style';
import { ModalHeader } from './modal-header';

export interface BaseWindowProps {
	emoji: string;
	name: string;
	modal?: boolean;
	onClose?: () => void;
}

const pop = keyframes`
from {
	transform: scale(0.8) translateY(-10%);
}
to {
	transform: scale(1) translateY(0);
}
`;

const bodyStyles = css`
	overflow: hidden;
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: stretch;
	align-items: stretch;
	flex: 1 0 0;
	position: relative;
`;

const Body = ({ children }: { children: preact.ComponentChildren }) => {
	return <div class={bodyStyles}>{children}</div>;
};

const styles = css`
	transition: transform 0.1s;
	animation: ${pop} 0.1s;
	transform-origin: 50% 20%;
	contain: content;
	border-radius: var(--radius);
	padding: 2px;
	display: grid;
	grid-template-rows: min-content 1fr;
	box-shadow: var(--shadow-1);
	overflow: hidden;
	background: var(--bg-light);
`;
export const Modal = ({
	emoji,
	name,
	children,
}: RouteIdentifiers & {
	width?: number;
	children: preact.ComponentChildren;
}) => {
	return (
		<div className={styles}>
			<ModalHeader name={name} emoji={emoji} />
			<Body>{children}</Body>
		</div>
	);
};
