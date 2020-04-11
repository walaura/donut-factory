import { createContext, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ID } from '../../helper/defs';
import { Modal } from '../components/Modal/Modal';
import { WindowHandleProvider } from './use-taskbar/Handles';
import {
	DeflatedTaskbarItemType,
	Item,
	TaskbarItemRenderer,
	TaskbarItemType,
} from './use-taskbar/Item';
const shortid = require('shortid');

type PushProps = {
	prefersContainer?: TaskbarItemRenderer;
	ev?: Pick<MouseEvent, 'clientX' | 'clientY'>;
};

export type TaskbarContext = {
	windows: TaskbarItemType[];
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
				<WindowHandleProvider id={item.id}>
					<Item item={item} />
				</WindowHandleProvider>
			))}
		</div>
	);
};

export const inflateTaskbarItem = (
	deflated: DeflatedTaskbarItemType,
	others: PushProps
): TaskbarItemType => {
	if ('route' in deflated) {
		return {
			id: shortid(),
			container: others.prefersContainer || Modal,
			route: deflated.route,
		};
	}
	return {
		id: shortid(),
		container: others.prefersContainer || Modal,
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
		closeWindow: (id) => {
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
