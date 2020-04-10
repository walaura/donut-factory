import { Target } from '../helper/target';
import { XY } from '../helper/xy';

type CanvasEditModes =
	| {
			editMode: false;
			editModeTarget: null;
	  }
	| {
			editMode: true;
			editModeTarget: Target | null;
	  };

export type CanvasRendererState = {
	selected: Target;
	cursor: XY;
	gameCursor: XY;
	zoom: number;
} & CanvasEditModes;
