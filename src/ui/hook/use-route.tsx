import { createContext, h, JSX } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { getRendererForRouter } from '../helper/route.helpers';
import { RouteIdentifiers, SerializableRoute } from '../helper/route.defs.ts';

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

	const RootComponent = renderer.root;
	//@ts-ignore
	const root = h(RootComponent, route[1]);

	return (
		<RouterContext.Provider value={{ root, identifiers, setIdentifiers }}>
			{children}
		</RouterContext.Provider>
	);
};

export const RouteFromProvider = () => useContext(RouterContext).root;
