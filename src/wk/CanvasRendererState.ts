import { Target } from '../helper/pathfinding';
import { XY } from '../helper/xy';
export type CanvasRendererState = {
	selected: Target;
	cursor: XY;
	gameCursor: XY;
	zoom: number;
	editMode: boolean;
	editingTarget: Target;
};
