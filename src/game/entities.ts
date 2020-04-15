import { ID, GameState, Entity, DeepPartial } from '../helper/defs';
import { dispatchToGame } from '../global/dispatch';
import { addId } from '../helper/generate';
type GameReducer<X> = import('../wk/game.actions').GameReducer<X>;

export const findEntity = (id: ID, gameState: GameState): Entity | null => {
	if (gameState.entities[id]) {
		return gameState.entities[id];
	}
	return null;
};

export const mergeEntity = <S extends Entity = Entity>(
	entityId: ID,
	mergeable: DeepPartial<S>
) => {
	dispatchToGame({
		type: 'merge-entity',
		entityId,
		mergeable,
	});
};

export const addEntity = (entity: Entity) => {
	dispatchToGame({
		type: 'add-entity',
		entity: entity,
	});
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

export const entityReducer: GameReducer<EntityAction> = (
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
