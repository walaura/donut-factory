import { routeRenderers } from '../routes';

type RouteIdentifiers = import('./route').RouteIdentifiers;
type RouteRenderer = import('./route').RouteRenderer;
type SerializableRoute = import('./route').SerializableRoute;

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
