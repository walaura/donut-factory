import { h } from 'preact';
import { Modal } from '../components/Modal/Modal';
import { MoneyInspector } from '../inspectors/money-inspector';
import { RouteRenderer, SerializableRoute } from './route.defs.ts';
import { AllEntitities } from '../windows/all-entities';
import { EntityInspector } from '../inspectors/entity-inspector';
import { DetailsModal } from '../components/Modal/DetailsModal';
import { SystemMenu } from '../windows/system';

const ledger: RouteRenderer<typeof MoneyInspector, typeof Modal> = {
	id: 'ledger',
	emoji: '💰',
	name: 'Money',
	container: Modal,
	root: MoneyInspector,
};

const allEntities: RouteRenderer<typeof AllEntitities, typeof DetailsModal> = {
	id: 'allEntities',
	emoji: '👩‍🔧',
	name: 'Staffing',
	container: DetailsModal,
	root: AllEntitities,
};

const entity: RouteRenderer<typeof EntityInspector, typeof Modal> = {
	id: 'entity',
	emoji: '🔵',
	name: 'Inspector',
	container: Modal,
	root: EntityInspector,
};

const system: RouteRenderer<typeof EntityInspector, typeof Modal> = {
	id: 'system',
	emoji: '🍔',
	name: 'Info & Settings',
	container: Modal,
	root: SystemMenu,
};

export const routeRenderers = { ledger, allEntities, system, entity };

export const getRendererForRouter = ([id]: SerializableRoute): RouteRenderer<
	typeof routeRenderers[typeof id]['root'],
	typeof routeRenderers[typeof id]['container']
> => routeRenderers[id];

export const renderRoute = (route: SerializableRoute) => {
	const Root = getRendererForRouter(route).root;
	//@ts-ignore
	return <Root {...route[1]} />;
};
