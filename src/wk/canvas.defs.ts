import { Target, GhostTarget } from '../helper/target';
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

export enum CanvasExceptionalMode {
	'Edit' = 'Edit',
	'Add' = 'Add',
}

export type CanvasRendererState = {
	selected: Target;
	followTarget: Target | null;
	screenCursor: XY;
	gameCursor: XY;
	debugMode: boolean;
	mode: CanvasExceptionalMode | null;
	editModeTarget: Target | null;
	createModeTarget: GhostTarget | null;
} & CanvasRendererStateViewport;
