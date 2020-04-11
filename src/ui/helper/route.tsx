import { h } from 'preact';
import { Modal } from '../components/modal/modal';
import { MoneyInspector } from '../inspectors/money-inspector';
import {
	RouteRenderer,
	SerializableRoute,
	RouteIdentifiers,
} from './route.defs.ts';
import { AllEntitities } from '../windows/all-entities';
import { EntityInspector } from '../inspectors/entity-inspector';
import { DetailsModal } from '../components/modal/details-modal';
import { SystemMenu } from '../windows/system';

const ledger: RouteRenderer<typeof MoneyInspector> = {
	id: 'ledger',
	emoji: '💰',
	name: 'Money',
	root: MoneyInspector,
};

const allEntities: RouteRenderer<typeof AllEntitities> = {
	id: 'allEntities',
	emoji: '👩‍🔧',
	name: 'Staffing',
	root: AllEntitities,
};

const entity: RouteRenderer<typeof EntityInspector> = {
	id: 'entity',
	emoji: '🔵',
	name: 'Inspector',
	root: EntityInspector,
};

const system: RouteRenderer<typeof SystemMenu> = {
	id: 'system',
	emoji: '🍔',
	name: 'Info & Settings',
	root: SystemMenu,
};

export const routeRenderers = { ledger, allEntities, system, entity };

export const getRouteIdentifiers = (
	route: SerializableRoute
): RouteIdentifiers => {
	const { emoji, name } = getRendererForRouter(route);
	return { emoji, name };
};

export const getRendererForRouter = ([id]: SerializableRoute): RouteRenderer<
	typeof routeRenderers[typeof id]['root']
> => routeRenderers[id];

export const renderRoute = (route: SerializableRoute) => {
	const Root = getRendererForRouter(route).root;
	//@ts-ignore
	return <Root {...route[1]} />;
};
