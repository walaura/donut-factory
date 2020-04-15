import { JSX } from 'preact';
import { WithID } from '../../helper/defs';

type RouteRenderers = import('./route').RouteRenderers;

export type SerializableRoute<
	K = keyof RouteRenderers
> = K extends keyof RouteRenderers
	? [K, Parameters<RouteRenderers[K]['root']>[0]]
	: never;

export type RouteIdentifiers = {
	emoji?: string;
	name: string;
};

export type RouteRendererHostProps<Props> = RouteIdentifiers & {
	root: (props: Props) => JSX.Element;
};

export type RouteRenderer<Root extends (args: any) => any> = WithID &
	RouteRendererHostProps<Parameters<Root>[0]>;
