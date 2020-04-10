export const dispatchToGame = (action: GameAction) => {
	if (self.memory.id === 'MAIN') {
		postFromWindow({
			action: MsgActions.PushGameAction,
			value: action,
		});
		return;
	}
	if (self.memory.id === 'GAME-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit :(';
};

export const dispatchToCanvas = (action: CanvasAction) => {
	if (self.memory.id === 'MAIN') {
		postFromWindow<CanvasRendererMessage>({
			action: MsgActions.PushCanvasAction,
			value: action,
		});
		return;
	}
	if (self.memory.id === 'CANVAS-WK') {
		self.memory.actionQueue.push(action);
		return;
	}
	throw 'This scope cant commit :(';
};
