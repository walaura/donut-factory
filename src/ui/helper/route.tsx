import { JSX } from 'preact';
import { WithID } from '../../helper/defs';
type RouteRenderers = import('../routes').RouteRenderers;

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export type SerializableRoute<
	K = keyof RouteRenderers
> = K extends keyof RouteRenderers
	? [K, Parameters<ThenArg<ReturnType<RouteRenderers[K]['root']>>>[0]]
	: never;

export type RouteIdentifiers = {
	emoji?: string;
	name: string;
};

export type RouteRenderer<Root extends (args: any) => any> = WithID &
	RouteIdentifiers & {
		root: () => Promise<(props: Parameters<Root>[0]) => JSX.Element>;
	};
