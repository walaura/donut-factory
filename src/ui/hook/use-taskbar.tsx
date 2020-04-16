import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ID } from '../../helper/defs';
import { XY } from '../../helper/xy';
import { Modal } from '../component/modal/modal';
import { TaskbarContext } from './use-taskbar/context';
import { WindowHandleProvider } from './use-taskbar/handles';
import {
	DeflatedTaskbarItemType,
	Item,
	TaskbarItemType,
} from './use-taskbar/item';
import { windowRequestEvent } from '../events';
const shortid = require('shortid');

export const Taskbar = () => {
	let { windows } = useContext(TaskbarContext);
	return (
		<div data-cssid="windows">
			{windows.map((item) => (
				<WindowHandleProvider key={item.id} item={item}>
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
			const inflated = inflateTaskbarItem(pushee, others);
			setWindows((w) => [...w, inflated]);
			setFocusStack((prev) => [inflated.id, ...prev]);
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
		self.addEventListener(windowRequestEvent, (ev) => {
			let {
				route,
				xy: { x, y },
			} = ev.detail;
			push(
				{ route },
				{
					ev: {
						clientX: x,
						clientY: y,
					},
				}
			);
		});
	}, []);

	return (
		<TaskbarContext.Provider value={value}>{children}</TaskbarContext.Provider>
	);
};
