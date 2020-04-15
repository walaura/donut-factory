import { h } from 'preact';
import { EntityInspector } from '../windows/inspectors/entity-inspector';
import { MoneyInspector } from '../windows/inspectors/money-inspector';
import { AllEntitities } from '../windows/all-entities';
import { SystemMenu } from '../windows/system';
import { getRendererForRouter } from './route.helpers';

export type RouteIdentifiers = import('./route.defs.ts').RouteIdentifiers;
export type RouteRenderer<X> = import('./route.defs.ts').RouteRenderer<X>;
export type SerializableRoute = import('./route.defs.ts').SerializableRoute;

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

export type RouteRenderers = typeof routeRenderers;
