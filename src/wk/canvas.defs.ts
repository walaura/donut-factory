import { Target } from '../helper/target';
import { XY } from '../helper/xy';

type CanvasEditModes =
	| {
			editMode: false;
			editModeTarget: null;
	  }
	| {
			editMode: boolean;
			editModeTarget: Target | null;
	  };

export type CanvasRendererStateViewport = {
	viewport: XY;
	zoom: number;
};

export type CanvasRendererState = {
	selected: Target;
	followTarget: Target | null;
	screenCursor: XY;
	gameCursor: XY;
	debugMode: boolean;
} & CanvasEditModes &
	CanvasRendererStateViewport;
