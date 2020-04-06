import { WithXY } from '../../defs';
import { html } from 'lit-html';

export const draggable = (pos: WithXY) => {
	let delta = { x: 0, y: 0 };
	let dragging = false;

	let handler = ({ screenX: x, screenY: y }) => {
		if (!dragging) {
			return;
		}
		pos.x = pos.x + x - delta.x;
		pos.y = pos.y + y - delta.y;

		delta = { x, y };
	};
	window.addEventListener('mouseup', () => {
		dragging = false;
	});
	window.addEventListener('mousemove', (ev) => {
		handler(ev);
	});
	const dragHandle = ({ screenX: x, screenY: y }) => {
		delta = { x, y };
		dragging = true;
	};
	const $draggable = (children) => html` <x-draggable
		style="--left: ${pos.x}px;--top: ${pos.y}px"
	>
		${children}
	</x-draggable>`;
	return { dragHandle, $draggable };
};
