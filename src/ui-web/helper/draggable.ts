import { html, directive, render } from 'lit-html';
import { XY } from '../../helper/xy';

export const draggable = (pos: XY) => {
	let delta = { x: 0, y: 0 };
	let dragging = false;
	let handler = ({ screenX: x, screenY: y }) => {
		if (!dragging) {
			return;
		}
		pos.x = pos.x + x - delta.x;
		pos.y = pos.y + y - delta.y;
		$draggableRef.style.setProperty('--left', pos.x + 'px');
		$draggableRef.style.setProperty('--top', pos.y + 'px');
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
	const $draggableRef = document.createElement('x-draggable');
	$draggableRef.style.setProperty('--left', pos.x + 'px');
	$draggableRef.style.setProperty('--top', pos.y + 'px');

	const $draggable = (children) => {
		render(children, $draggableRef);
		return $draggableRef;
	};

	return { dragHandle, $draggable };
};
