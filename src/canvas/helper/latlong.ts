import { XY, xyMap, xyRound } from '../../helper/xy';
import { CanvasRendererState } from '../../wk/canvas.defs';

/*
[WORLD] (example - 10,20)
okay so entities have a xy pos in the world. 
Use this to calculate distances between entities 
or whatever – not hella useful in the game layer.
Youll wanna to apply zoom and get absolute pixels

[ABSOLUTE] (example - 200,400)
You can use these for anything relative to entities.
However theres also a viewport that can be panned.
this translates the position by another xy pixels. 
Use this to locate a characters world coordinates in
a way where you can run calculation on screen

[VIEWPORT] (example -50, 60)
You always wanna draw at viewport position, 
this is tricky. Also not super true bc the map
for example uses a tile system that idk how it maps 
to anything yet it just sorta works
*/

/*
[WORLD] -> [ABS] - [VIEWPORT]
*/
export const worldToAbs = (xy: XY) =>
	xyMap(xy, (xy, k) => {
		if (self.memory.id !== 'CANVAS-WK') {
			throw 'no';
		}
		return xy[k] * (self.memory.state as CanvasRendererState).zoom;
	});
export const absToViewport = (xy: XY) =>
	xyMap(xy, (xy, k) => {
		if (self.memory.id !== 'CANVAS-WK') {
			throw 'no';
		}
		return xy[k] + (self.memory.state as CanvasRendererState).viewport[k];
	});
export const worldToViewport = (xy: XY) => absToViewport(worldToAbs(xy));

/*
[VIEWPORT] -> [ABS] - [WORLD]
*/
export const viewportToAbs = (xy: XY) =>
	xyMap(xy, (xy, k) => {
		if (self.memory.id !== 'CANVAS-WK') {
			throw 'no';
		}
		return xy[k] - (self.memory.state as CanvasRendererState).viewport[k];
	});
export const absToWorld = (xy: XY) =>
	xyMap(xy, (xy, k) => {
		if (self.memory.id !== 'CANVAS-WK') {
			throw 'no';
		}
		return xy[k] / (self.memory.state as CanvasRendererState).zoom;
	});
export const viewportToWorld = (xy: XY) =>
	xyRound(absToWorld(viewportToAbs(xy)));
