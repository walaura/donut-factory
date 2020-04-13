import { XY, Size } from '../../../helper/xy';
import { useEffect, useRef, useState, PropRef } from 'preact/hooks';
import { h } from 'preact';
import { css } from '../../helper/style';
import { DetailsModal } from '../../component/modal/details-modal';
import { useTaskbar } from '../use-taskbar';
import { ID } from '../../../helper/defs';

const PADDING = 20;
const STARTING_Z_INDEX = 100;

const style = css`
	position: fixed;
	top: 0;
	left: 0;
	display: grid;
	justify-content: stretch;
	align-content: stretch;
	will-change: transform;
	z-index: ${STARTING_Z_INDEX * 10};
	padding: ${PADDING};
	transform: translate(calc(var(--left) - 1em), calc(var(--top) - 1em));
	width: var(--width);
	height: var(--height);
	visibility: var(--visibility, hidden);
`;

export type DragHandle = ({
	screenX,
	screenY,
}: {
	screenX: number;
	screenY: number;
}) => void;

const adjustXY = ({ x, y }, { width, height }) => {
	x =
		x + Math.min(0, document.body.clientWidth - x - (width / 2 - PADDING * 2));
	y =
		y +
		Math.min(0, document.body.clientHeight - y - (height / 2 - PADDING * 2));

	y = Math.max(y, 100);
	x = Math.max(x, width / -2);
	return { x, y };
};

const adjustInitialXY = (xy, { width, height }) => {
	xy = adjustXY(xy, { width, height });
	let { x, y } = xy;
	x = Math.min(x, document.body.clientWidth - width - PADDING * 2);
	return { x, y };
};

const applySize = (
	ref: PropRef<HTMLDivElement>,
	{ x, y }: XY,
	{ width, height }: Size
) => {
	ref.current?.style.setProperty('--left', x + 'px');
	ref.current?.style.setProperty('--top', y + 'px');
	ref.current?.style.setProperty('--height', height + 'px');
	ref.current?.style.setProperty('--width', width + 'px');
	ref.current?.style.setProperty('--visibility', 'visible');
};

const defaultWindowSize = {
	width: 300,
	height: 500,
};

export const Draggable = ({
	children,
	id,
	startAt = {
		x: 50,
		y: 25,
	},
	size = defaultWindowSize,
}: {
	children: (handle) => preact.ComponentChildren;
	id: ID;
	startAt?: XY;
	size?: Size;
}) => {
	let { focus, focusStack } = useTaskbar();
	const r = useRef<HTMLDivElement>();
	let [handle, setHandle] = useState(null);
	startAt = adjustInitialXY(startAt, size);
	let pos = startAt;
	useEffect(() => {
		r.current?.style.setProperty(
			'z-index',
			STARTING_Z_INDEX +
				Math.abs(focusStack.indexOf(id) - focusStack.length) +
				''
		);
	}, [focusStack]);
	useEffect(() => {
		let delta = { x: 0, y: 0 };
		let dragging = false;
		let handler = ({ screenX: x, screenY: y }) => {
			if (!dragging) {
				return;
			}
			pos.x = pos.x + x - delta.x;
			pos.y = pos.y + y - delta.y;
			pos = adjustXY(pos, size);
			applySize(r, pos, size);
			delta = { x, y };
		};
		window.addEventListener('mouseup', () => {
			dragging = false;
		});
		window.addEventListener('mousemove', (ev) => {
			handler(ev);
		});
		//@ts-ignore
		setHandle(() => ({ screenX: x, screenY: y }) => {
			delta = { x, y };
			dragging = true;
		});
	}, []);
	useEffect(() => {
		if (!handle) return;
		applySize(r, pos, size);
		r.current?.addEventListener('mousedown', () => {
			focus(id);
		});
		r.current?.addEventListener('focus', () => {
			focus(id);
		});
	}, [handle]);
	if (!handle) {
		return null;
	}
	return (
		<div class={style} ref={r}>
			{children(handle)}
		</div>
	);
};
