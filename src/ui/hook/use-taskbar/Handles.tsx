import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

import { useTaskbar } from '../use-taskbar';
import { Draggable, DragHandle } from '../../components/primitives/draggable';

const WindowHandlesContext = createContext<WindowHandles>(
	(null as any) as WindowHandles
);

/*
const adjustxy = (x, y) => {
	x = x + Math.min(0, document.body.clientWidth - x - width - 40);
	if (x > docum ent.body.clientWidth / 2) {
		y = Math.max(y, 100);
	}
};
*/

export interface WindowHandles {
	dragHandle: DragHandle;
	closeHandle: () => void;
}
export const useWindowHandles = (): WindowHandles =>
	useContext(WindowHandlesContext);

export const WindowHandleProvider = ({ children, id }) => {
	let { closeWindow } = useTaskbar();

	return (
		<Draggable startAt={{ x: 20, y: 20 }}>
			{(dragHandle) => (
				<WindowHandlesContext.Provider
					value={{
						dragHandle,
						closeHandle: () => {
							closeWindow(id);
						},
					}}>
					{children}
				</WindowHandlesContext.Provider>
			)}
		</Draggable>
	);
};
