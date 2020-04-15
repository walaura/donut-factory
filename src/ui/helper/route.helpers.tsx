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

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export const getRendererForRouter = ([id]: SerializableRoute): RouteRenderer<
	ThenArg<ReturnType<typeof routeRenderers[typeof id]['root']>>
> => routeRenderers[id];
