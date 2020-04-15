import { createContext, h, JSX } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { getRendererForRouter } from '../helper/route.helpers';
import { RouteIdentifiers, SerializableRoute } from '../helper/route';

type SecretRouterContext = {
	root: JSX.Element;
	identifiers: RouteIdentifiers;
	setIdentifiers: (newIds: RouteIdentifiers) => void;
};

type RouterContext = Pick<
	SecretRouterContext,
	'identifiers' | 'setIdentifiers'
>;

const RouterContext = createContext<SecretRouterContext>(
	(null as any) as SecretRouterContext
);

const RouteLoader = ({ loader, props }) => {
	const [Loaded, setLoaded] = useState<(() => JSX.Element) | null>(null);
	useEffect(() => {
		loader().then((p) => {
			setLoaded(() => p);
		});
	});
	if (Loaded) {
		return <Loaded {...props} />;
	}
	return null;
};

export const RouteProvider = ({
	children,
	route,
}: {
	children;
	route: SerializableRoute;
}) => {
	const renderer = getRendererForRouter(route);
	const [identifiers, setIdentifiers] = useState({
		emoji: renderer.emoji,
		name: renderer.name,
	});
	const root = <RouteLoader loader={renderer.root} props={route[1]} />;
	//@ts-ignore
	//const root = h(RootComponent, route[1]);
	return (
		<RouterContext.Provider value={{ root, identifiers, setIdentifiers }}>
			{children}
		</RouterContext.Provider>
	);
};

export const RouteFromProvider = () => useContext(RouterContext).root;
