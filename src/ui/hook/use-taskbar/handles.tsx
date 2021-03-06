import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';
import { useTaskbar } from './context';
import { Draggable, DragHandle } from './draggable';
type TaskbarItemType = import('./item').TaskbarItemType;

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
		<Draggable id={item.id} startAt={item.position} size={item.size}>
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
