import { createContext, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ID } from '../../helper/defs';
import { Modal } from '../components/modal/modal';
import { WindowHandleProvider } from './use-taskbar/handles';
import {
	DeflatedTaskbarItemType,
	Item,
	TaskbarItemRenderer,
	TaskbarItemType,
} from './use-taskbar/item';
import { XY, Size } from '../../helper/xy';
const shortid = require('shortid');

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

const TaskbarContext = createContext<TaskbarContext>(
	(null as any) as TaskbarContext
);
export const useTaskbar = () => useContext(TaskbarContext);

export const Taskbar = () => {
	let { windows } = useContext(TaskbarContext);

	return (
		<div data-cssid="windows">
			{windows.map((item) => (
				<WindowHandleProvider item={item}>
					<Item item={item} />
				</WindowHandleProvider>
			))}
		</div>
	);
};

const evToXY = ({
	clientX: x,
	clientY: y,
}: Pick<MouseEvent, 'clientX' | 'clientY'>): XY => ({ x, y });

export const inflateTaskbarItem = (
	deflated: DeflatedTaskbarItemType,
	others: PushProps
): TaskbarItemType => {
	if ('route' in deflated) {
		return {
			position: others.ev ? evToXY(others.ev) : undefined,
			id: shortid(),
			container: others.prefersContainer || Modal,
			route: deflated.route,
			size: others.size,
		};
	}
	return {
		position: others.ev ? evToXY(others.ev) : undefined,
		id: shortid(),
		container: others.prefersContainer || Modal,
		size: others.size,
		...deflated,
	};
};

export const TaskbarProvider = ({
	children,
	pusher,
}: {
	children;
	pusher?: TaskbarContext['push'];
}) => {
	const [windows, setWindows] = useState<TaskbarContext['windows']>([]);
	const [focusStack, setFocusStack] = useState<TaskbarContext['focusStack']>(
		[]
	);

	let push: TaskbarContext['push'];
	if (pusher) {
		push = pusher;
	} else {
		push = (pushee, others) => {
			setWindows((w) => [...w, inflateTaskbarItem(pushee, others)]);
		};
	}

	const value: TaskbarContext = {
		windows,
		focusStack,
		focus: (id: ID) => {
			setFocusStack((prev) => [id, ...prev]);
		},
		closeWindow: (id: ID) => {
			setWindows((ws) => ws.filter((w) => w.id !== id));
		},
		push,
	};

	useEffect(() => {
		if (self.memory.id === 'MAIN') {
			if (self.memory.ui) {
				return;
			}
			self.memory.ui = {
				pushRoute: ({ x, y }, route) => {
					push(
						{ route },
						{
							ev: {
								clientX: x,
								clientY: y,
							},
						}
					);
				},
			};
		}
	}, []);

	return (
		<TaskbarContext.Provider value={value}>{children}</TaskbarContext.Provider>
	);
};
