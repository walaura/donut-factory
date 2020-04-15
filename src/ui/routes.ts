import { RouteRenderer } from './helper/route';

const ledger: RouteRenderer<typeof import('./windows/inspectors/money-inspector').MoneyInspector> = {
	id: 'ledger',
	emoji: '💰',
	name: 'Money',
	root: () =>
		import('./windows/inspectors/money-inspector').then(
			(m) => m.MoneyInspector
		),
};

const allEntities: RouteRenderer<typeof import('./windows/all-entities').AllEntitities> = {
	id: 'allEntities',
	emoji: '👩‍🔧',
	name: 'Staffing',
	root: () => import('./windows/all-entities').then((m) => m.AllEntitities),
};

const entity: RouteRenderer<typeof import('./windows/inspectors/entity-inspector').EntityInspector> = {
	id: 'entity',
	emoji: '🔵',
	name: 'Inspector',
	root: () =>
		import('./windows/inspectors/entity-inspector').then(
			(m) => m.EntityInspector
		),
};

const system: RouteRenderer<typeof import('./windows/system').SystemMenu> = {
	id: 'system',
	emoji: '🍔',
	name: 'Info & Settings',
	root: () => import('./windows/system').then((m) => m.SystemMenu),
};

export const routeRenderers = { ledger, allEntities, system, entity };

export type RouteRenderers = typeof routeRenderers;
