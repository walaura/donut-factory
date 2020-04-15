import { createContext, h, JSX } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { ID, DistributiveOmit } from '../../../helper/defs';
import { getRouteIdentifiers } from '../../helper/route';
import {
	RouteIdentifiers,
	SerializableRoute,
} from '../../helper/route.defs.ts';
import { RouteFromProvider, RouteProvider } from '../use-route';
import { useTaskbar } from './context';
import { XY, Size } from '../../../helper/xy';

export type TaskbarItemRenderer = (
	props: RouteIdentifiers & { children: JSX.Element }
) => JSX.Element;

export type TaskbarItemType = {
	id: ID;
	container: TaskbarItemRenderer;
	position?: XY;
	size?: Size;
} & (
	| {
			route: SerializableRoute;
	  }
	| {
			content: JSX.Element;
			emoji?: string;
			name: string;
	  }
);

export type DeflatedTaskbarItemType = DistributiveOmit<
	TaskbarItemType,
	'id' | 'container' | 'position' | 'size'
>;

const defaultIdentifiers = {
	name: 'No title',
};
const TaskbarItemContext = createContext<{
	identifiers: RouteIdentifiers;
	closeWindow: () => void;
	setIdentifiers: (newIds: RouteIdentifiers) => void;
}>({
	identifiers: defaultIdentifiers,
	setIdentifiers: () => {},
	closeWindow: () => {},
});
export const useTaskbarItem = () => useContext(TaskbarItemContext);

const ItemFromRoute = ({
	route,
	container: Container,
}: {
	route: SerializableRoute;
	container: TaskbarItemRenderer;
}) => {
	const { identifiers } = useTaskbarItem();
	return (
		<RouteProvider route={route}>
			<Container {...identifiers}>
				<RouteFromProvider />
			</Container>
		</RouteProvider>
	);
};

const ItemFromMadlands = ({
	container: Container,
	content,
}: {
	container: TaskbarItemRenderer;
	content: JSX.Element;
} & RouteIdentifiers) => {
	const { identifiers } = useTaskbarItem();
	return <Container {...identifiers}>{content}</Container>;
};

const getItemIdentifiers = (item: TaskbarItemType): RouteIdentifiers => {
	if ('name' in item) {
		return item;
	}
	if ('route' in item) {
		return getRouteIdentifiers(item.route);
	}
	return defaultIdentifiers;
};

export const Item = ({ item }: { item: TaskbarItemType }) => {
	const { closeWindow } = useTaskbar();
	const [identifiers, setIdentifiers] = useState(getItemIdentifiers(item));
	return (
		<TaskbarItemContext.Provider
			value={{
				identifiers,
				setIdentifiers,
				closeWindow: () => {
					closeWindow(item.id);
				},
			}}>
			{'route' in item ? (
				<ItemFromRoute container={item.container} route={item.route} />
			) : (
				<ItemFromMadlands container={item.container} {...item} />
			)}
		</TaskbarItemContext.Provider>
	);
};
