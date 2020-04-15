import { routeRenderers } from './route';

type RouteIdentifiers = import('./route.defs.ts').RouteIdentifiers;
type RouteRenderer<X> = import('./route.defs.ts').RouteRenderer<X>;
type SerializableRoute = import('./route.defs.ts').SerializableRoute;

export const getRouteIdentifiers = (
	route: SerializableRoute
): RouteIdentifiers => {
	const { emoji, name } = getRendererForRouter(route);
	return { emoji, name };
};

export const getRendererForRouter = ([id]: SerializableRoute): RouteRenderer<
	typeof routeRenderers[typeof id]['root']
> => routeRenderers[id];
