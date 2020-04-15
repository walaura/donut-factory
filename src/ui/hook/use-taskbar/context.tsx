import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { ID } from '../../../helper/defs';
import { Size } from '../../../helper/xy';

type TaskbarItemType = import('./item').TaskbarItemType;
type DeflatedTaskbarItemType = import('./item').DeflatedTaskbarItemType;
type TaskbarItemRenderer = import('./item').TaskbarItemRenderer;

type PushProps = {
	prefersContainer?: TaskbarItemRenderer;
	ev?: Pick<MouseEvent, 'clientX' | 'clientY'>;
	size?: Size;
};

export type TaskbarContext = {
	windows: TaskbarItemType[];
	focusStack: ID[];
	focus: (itemId: ID) => void;
	push: (item: DeflatedTaskbarItemType, props: PushProps) => void;
	closeWindow: (id: ID) => void;
};

export const TaskbarContext = createContext<TaskbarContext>(
	(null as any) as TaskbarContext
);
export const useTaskbar = () => useContext(TaskbarContext);
