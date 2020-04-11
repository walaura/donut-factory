import { XY } from '../../helper/xy';
import { useEffect, useRef, useState } from 'preact/hooks';
import { h } from 'preact';
import { css } from '../helper/style';

const style = css`
	position: fixed;
	top: 0;
	left: 0;
	will-change: transform;
	padding: 2em;
	transform: translate(calc(var(--left) - 1em), calc(var(--top) - 1em));
`;

export type DragHandle = ({
	screenX,
	screenY,
}: {
	screenX: number;
	screenY: number;
}) => void;

export const Draggable = ({
	children,
	startAt,
}: {
	children: (handle) => preact.ComponentChildren;
	startAt: XY;
}) => {
	const r = useRef<HTMLDivElement>();
	let [handle, setHandle] = useState(null);
	useEffect(() => {
		let pos = startAt;
		let delta = { x: 0, y: 0 };
		let dragging = false;
		let handler = ({ screenX: x, screenY: y }) => {
			if (!dragging) {
				return;
			}
			pos.x = pos.x + x - delta.x;
			pos.y = pos.y + y - delta.y;
			r.current?.style.setProperty('--left', pos.x + 'px');
			r.current?.style.setProperty('--top', pos.y + 'px');
			delta = { x, y };
		};
		window.addEventListener('mouseup', () => {
			dragging = false;
		});
		window.addEventListener('mousemove', (ev) => {
			handler(ev);
		});
		setHandle(() => ({ screenX: x, screenY: y }) => {
			delta = { x, y };
			dragging = true;
		});
	}, []);
	if (!handle) {
		return null;
	}
	return (
		<div class={style} ref={r}>
			{children(handle)}
		</div>
	);
};
