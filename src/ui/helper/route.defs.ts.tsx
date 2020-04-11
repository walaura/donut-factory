import { JSX } from 'preact';
import { WithID } from '../../helper/defs';
import { routeRenderers } from './route';

export type SerializableRoute<
	K = keyof typeof routeRenderers
> = K extends keyof typeof routeRenderers
	? [K, Parameters<typeof routeRenderers[K]['root']>[0]]
	: never;

export type Identifiers = {
	emoji: string;
	name: string;
};

export type BaseRouteRendererProps = Identifiers & {
	children: preact.ComponentChildren;
};

export type RouteRendererHostProps<P> = Identifiers & {
	root: (props: P) => JSX.Element;
};

export type RouteRenderer<
	Host extends (args: any) => any,
	Container extends (args: any) => any
> = RouteRendererHostProps<Parameters<Host>[0]> extends Pick<
	Parameters<Container>[0],
	keyof RouteRendererHostProps<Parameters<Host>[0]>
>
	? WithID &
			RouteRendererHostProps<Parameters<Host>[0]> & {
				container: Container;
			}
	: never;
