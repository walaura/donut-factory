import { XY, xyAdd } from './xy';

export enum Direction {
	Top = 1,
	Right = 2,
	Bottom = 4,
	Left = 8,
}

export enum AngleDirection {
	TopLeft = Direction.Top | Direction.Left,
	TopRight = Direction.Top | Direction.Right,
	BottomRight = Direction.Bottom | Direction.Right,
	BottomLeft = Direction.Bottom | Direction.Left,
}

export enum AnyDirection {
	Top = Direction.Top,
	Right = Direction.Right,
	Bottom = Direction.Bottom,
	Left = Direction.Left,
	TopLeft = AngleDirection.TopLeft,
	TopRight = AngleDirection.TopRight,
	BottomRight = AngleDirection.BottomRight,
	BottomLeft = AngleDirection.BottomLeft,
}

export const cornerDirectionList: AnyDirection[] = [
	AnyDirection.TopLeft,
	AnyDirection.TopRight,
	AnyDirection.BottomLeft,
	AnyDirection.BottomRight,
];

export const anyDirectionList: AnyDirection[] = [
	AnyDirection.Top,
	AnyDirection.Right,
	AnyDirection.Bottom,
	AnyDirection.Left,
	...cornerDirectionList,
];

export const oppositeDirection = (d: AnyDirection): AnyDirection => {
	let oppositemap = {
		[AnyDirection.Top]: AnyDirection.Bottom,
		[AnyDirection.Right]: AnyDirection.Left,
		[AnyDirection.Bottom]: AnyDirection.Top,
		[AnyDirection.Left]: AnyDirection.Right,
		[AnyDirection.TopLeft]: AnyDirection.BottomRight,
		[AnyDirection.TopRight]: AnyDirection.BottomLeft,
		[AnyDirection.BottomLeft]: AnyDirection.TopRight,
		[AnyDirection.BottomRight]: AnyDirection.TopLeft,
	};
	return oppositemap[d];
};

export const directionDiffs: Map<AnyDirection, XY> = new Map([
	[
		AnyDirection.Top,
		{
			x: 0,
			y: -1,
		},
	],
	[
		AnyDirection.Right,
		{
			x: 1,
			y: 0,
		},
	],
	[
		AnyDirection.Bottom,
		{
			x: 0,
			y: 1,
		},
	],
	[
		AnyDirection.Left,
		{
			x: -1,
			y: 0,
		},
	],
	[
		AnyDirection.TopLeft,
		{
			x: -1,
			y: 1,
		},
	],
	[
		AnyDirection.TopRight,
		{
			x: 1,
			y: 1,
		},
	],
	[
		AnyDirection.BottomLeft,
		{
			x: -1,
			y: -1,
		},
	],
	[
		AnyDirection.BottomRight,
		{
			x: 1,
			y: -1,
		},
	],
]);

export const addDirectionsToXY = <Return = XY>(
	xy: XY,
	transformer: (xy: XY) => Return = (_) => _
): Map<AnyDirection, Return> => {
	let returnable = new Map();
	for (let [direction, delta] of directionDiffs.entries()) {
		returnable.set(direction, transformer(xyAdd(xy, delta)));
	}
	return returnable;
};
