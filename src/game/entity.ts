import { ID, GameState, Entity, DeepPartial } from '../helper/defs';
import { Reducer } from '../global/actions';

export const findEntity = (id: ID, gameState: GameState): Entity | null => {
	if (gameState.entities[id]) {
		return gameState.entities[id];
	}
	return null;
};

export type EntityAction =
	| {
			type: 'merge-entity';
			entityId: ID;
			mergeable: DeepPartial<Entity>;
	  }
	| {
			type: 'delete-entity';
			entityId: ID;
	  }
	| {
			type: 'add-entity';
			entity: Entity;
	  };

export const entityReducer: Reducer<EntityAction> = (
	action,
	{ gameState, onEntity }
) => {
	switch (action.type) {
		case 'merge-entity': {
			return onEntity<any>(action.entityId, () => action.mergeable);
		}
		case 'add-entity': {
			gameState.entities[action.entity.id] = action.entity;
			return gameState;
		}
		case 'delete-entity': {
			delete gameState.entities[action.entityId];
			return gameState;
		}
	}
};
