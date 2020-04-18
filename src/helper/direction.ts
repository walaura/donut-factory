import { XY, xyAdd } from './xy';

export enum StraightDirection {
	Top = 1,
	Right = 2,
	Bottom = 4,
	Left = 8,
}

export enum AngleDirection {
	TopLeft = StraightDirection.Top | StraightDirection.Left,
	TopRight = StraightDirection.Top | StraightDirection.Right,
	BottomRight = StraightDirection.Bottom | StraightDirection.Right,
	BottomLeft = StraightDirection.Bottom | StraightDirection.Left,
}

export enum Direction {
	Top = StraightDirection.Top,
	Right = StraightDirection.Right,
	Bottom = StraightDirection.Bottom,
	Left = StraightDirection.Left,
	TopLeft = AngleDirection.TopLeft,
	TopRight = AngleDirection.TopRight,
	BottomRight = AngleDirection.BottomRight,
	BottomLeft = AngleDirection.BottomLeft,
}

export const cornerDirectionList: Direction[] = [
	Direction.TopLeft,
	Direction.TopRight,
	Direction.BottomLeft,
	Direction.BottomRight,
];

export const straightDirectionList: Direction[] = [
	Direction.Top,
	Direction.Right,
	Direction.Bottom,
	Direction.Left,
];

export const anyDirectionList: Direction[] = [
	...straightDirectionList,
	...cornerDirectionList,
];

export const oppositeDirection = (d: Direction): Direction => {
	let oppositemap = {
		[Direction.Top]: Direction.Bottom,
		[Direction.Right]: Direction.Left,
		[Direction.Bottom]: Direction.Top,
		[Direction.Left]: Direction.Right,
		[Direction.TopLeft]: Direction.BottomRight,
		[Direction.TopRight]: Direction.BottomLeft,
		[Direction.BottomLeft]: Direction.TopRight,
		[Direction.BottomRight]: Direction.TopLeft,
	};
	return oppositemap[d];
};

export const directionDiffs: Map<Direction, XY> = new Map([
	[
		Direction.Top,
		{
			x: 0,
			y: -1,
		},
	],
	[
		Direction.Right,
		{
			x: 1,
			y: 0,
		},
	],
	[
		Direction.Bottom,
		{
			x: 0,
			y: 1,
		},
	],
	[
		Direction.Left,
		{
			x: -1,
			y: 0,
		},
	],
	[
		Direction.TopLeft,
		{
			x: -1,
			y: -1,
		},
	],
	[
		Direction.TopRight,
		{
			x: 1,
			y: -1,
		},
	],
	[
		Direction.BottomLeft,
		{
			x: -1,
			y: 1,
		},
	],
	[
		Direction.BottomRight,
		{
			x: 1,
			y: 1,
		},
	],
]);

export const addDirectionsToXY = <Return = XY>(
	xy: XY,
	transformer: (xy: XY) => Return = (_) => _
): Map<Direction, Return> => {
	let returnable = new Map();
	for (let [direction, delta] of directionDiffs.entries()) {
		returnable.set(direction, transformer(xyAdd(xy, delta)));
	}
	return returnable;
};
