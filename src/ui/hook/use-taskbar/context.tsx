import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { ID } from '../../../helper/defs';
import { Size } from '../../../helper/xy';

type PushProps = {
	prefersContainer?: import('./item').TaskbarItemRenderer;
	ev?: Pick<MouseEvent, 'clientX' | 'clientY'>;
	size?: Size;
};

export type TaskbarContext = {
	windows: import('./item').TaskbarItemType[];
	focusStack: ID[];
	focus: (itemId: ID) => void;
	push: (
		item: import('./item').DeflatedTaskbarItemType,
		props: PushProps
	) => void;
	closeWindow: (id: ID) => void;
};

export const TaskbarContext = createContext<TaskbarContext>(
	(null as any) as TaskbarContext
);
export const useTaskbar = () => useContext(TaskbarContext);
