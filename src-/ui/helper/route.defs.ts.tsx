import { JSX } from 'preact';
import { WithID } from '../../helper/defs';
import { routeRenderers } from './route';

export type SerializableRoute<
	K = keyof typeof routeRenderers
> = K extends keyof typeof routeRenderers
	? [K, Parameters<typeof routeRenderers[K]['root']>[0]]
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
