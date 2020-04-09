import { entityHasHandler, GameState } from '../helper/defs';
import { semiFlatten } from '../helper/ledger';
import { getHandlers } from '../global/handlers';
import { commitActions } from '../global/actions';

let time = Date.now();

export const gameLoop = (prevState: GameState) => {
	let gameState = { ...prevState };

	gameState.paused = false;
	const now = Date.now();
	const delta = (now - time) / 16;
	time = now;
	gameState.date += 1000;

	//attach handlers
	for (let entity of Object.values(gameState.entities)) {
		if (entityHasHandler(entity)) {
			entity = getHandlers()[entity.handler](delta, entity as any, gameState);
		}
	}

	// mutations
	gameState = commitActions(gameState);

	//clean the ledger lol;
	if (gameState.ledger.length > 200) {
		gameState.ledger = semiFlatten(gameState.ledger);
	}

	return gameState;
};
