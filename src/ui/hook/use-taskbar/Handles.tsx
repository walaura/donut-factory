import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

import { useTaskbar } from '../use-taskbar';
import { Draggable, DragHandle } from '../../components/primitives/draggable';
import { TaskbarItemType } from './Item';

const WindowHandlesContext = createContext<WindowHandles>(
	(null as any) as WindowHandles
);

export interface WindowHandles {
	dragHandle: DragHandle;
	closeHandle: () => void;
}
export const useWindowHandles = (): WindowHandles =>
	useContext(WindowHandlesContext);

export const WindowHandleProvider = ({
	children,
	item,
}: {
	children;
	item: TaskbarItemType;
}) => {
	let { closeWindow } = useTaskbar();
	return (
		<Draggable startAt={item.position} size={item.size}>
			{(dragHandle) => (
				<WindowHandlesContext.Provider
					value={{
						dragHandle,
						closeHandle: () => {
							closeWindow(item.id);
						},
					}}>
					{children}
				</WindowHandlesContext.Provider>
			)}
		</Draggable>
	);
};
