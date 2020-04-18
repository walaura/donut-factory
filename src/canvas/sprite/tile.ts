import {
	Direction,
	cornerDirectionList,
	anyDirectionList,
	straightDirectionList,
	oppositeDirection,
} from '../../helper/direction';
import { makeCanvas } from '../helper/canvas-store';
import { Scaler } from './scaler';
import { Sprite } from './sprite';
import { debounceLog } from '../../helper/debounce';
import { Print } from './print';

export const SIZE = 40;
const rotateDirectionMap = {
	[Direction.Top]: 0,
	[Direction.Right]: Math.PI / 2,
	[Direction.Bottom]: Math.PI,
	[Direction.Left]: Math.PI / -2,
	[Direction.TopLeft]: Math.PI / -2,
	[Direction.TopRight]: 0,
	[Direction.BottomLeft]: Math.PI,
	[Direction.BottomRight]: Math.PI / 2,
};
const colors = {
	grass: '#d8f2c4',
	water: '#d9fcfc',
	dirt: '#DDD0D0',
	HOTPINK4DEBUG: 'hotpink',
};
export type TileColor = keyof typeof colors;

export type TileProps =
	| { type: 'full'; color: TileColor }
	| { type: 'half'; colors: [TileColor, TileColor]; direction: Direction }
	| {
			type: 'corner';
			colors: [TileColor, TileColor];
			direction: Direction;
	  };

const Tile = (props: TileProps): OffscreenCanvas => {
	let memoId = [
		'tile',
		props.type,
		props.direction ?? '',
		props.color ?? '',
		...(props.colors ?? []),
	];
	return makeCanvas(
		{ width: SIZE, height: SIZE },
		memoId
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

		if (props.type === 'full') {
			ctx.fillStyle = colors[props.color];
			ctx.fillRect(0, 0, SIZE, SIZE);
			return canvas;
		}

		if (props.direction !== Direction.Top) {
			return Scaler(Tile({ ...props, direction: Direction.Top }), {
				width: SIZE,
				height: SIZE,
				offset: 0,
				memoId: memoId,
				rotate: rotateDirectionMap[props.direction],
			});
		}

		let [outerColor, innerColor] = props.colors;

		ctx.drawImage(
			Sprite(props.type === 'half' ? 'maskSplit' : 'maskCorner'),
			0,
			0,
			SIZE,
			SIZE
		);
		ctx.globalCompositeOperation = 'source-in';
		ctx.fillStyle = colors[props.type === 'half' ? innerColor : outerColor];
		ctx.fillRect(0, 0, SIZE, SIZE);

		ctx.globalCompositeOperation = 'destination-over';
		ctx.fillStyle = colors[props.type === 'half' ? outerColor : innerColor];
		ctx.fillRect(0, 0, SIZE, SIZE);

		ctx.globalCompositeOperation = 'source-over';
		if (props.type == 'half' && innerColor === 'water') {
			ctx.drawImage(Sprite('waterOverlay'), 0, 0, SIZE, SIZE);
		}
		if (props.type == 'corner' && innerColor === 'water') {
			ctx.drawImage(Sprite('waterCornerOverlayOut'), 0, 0, SIZE, SIZE);
		}
		if (props.type == 'corner' && outerColor === 'water') {
			ctx.drawImage(Sprite('waterCornerOverlay'), 0, 0, SIZE, SIZE);
		}

		return canvas;
	});
};

const opposites = {
	[Direction.Bottom]: [Direction.Left, Direction.Right],
	[Direction.Top]: [Direction.Left, Direction.Right],
	[Direction.Left]: [Direction.Bottom, Direction.Top],
	[Direction.Right]: [Direction.Bottom, Direction.Top],
};

const rotas = {
	[Direction.BottomRight]: [Direction.Bottom, Direction.Right],
	[Direction.BottomLeft]: [Direction.Bottom, Direction.Left],
	[Direction.TopRight]: [Direction.Top, Direction.Right],
	[Direction.TopLeft]: [Direction.Top, Direction.Left],
};

export const smoothTile = (
	color: TileColor,
	toColor: TileColor,
	neighbors: Map<Direction, TileColor>
): ReturnType<typeof Tile> | null => {
	//return Print(neighbors.get(AnyDirection.Left) + '');
	for (let direction of straightDirectionList) {
		if (
			neighbors.get(direction) === toColor &&
			opposites[direction]
				.map((d) => neighbors.get(d) !== toColor)
				.every(Boolean)
		) {
			return Tile({
				type: 'half',
				colors: [toColor, color],
				direction,
			});
		}
	}
	for (let direction of cornerDirectionList) {
		if (
			neighbors.get(direction) === toColor &&
			rotas[direction].map((d) => neighbors.get(d) === toColor).every(Boolean)
		) {
			return Tile({
				type: 'corner',
				colors: [color, toColor],
				direction,
			});
		}
	}

	for (let direction of cornerDirectionList) {
		if (
			neighbors.get(direction) === toColor &&
			cornerDirectionList
				.filter((d) => d !== direction)
				.map((d) => neighbors.get(d) !== toColor)
				.every(Boolean)
		) {
			return Tile({
				type: 'corner',
				colors: [toColor, color],
				direction: oppositeDirection(direction),
			});
		}
	}

	return null;
	let diffs = cornerDirectionList.filter((d) => neighbors.get(d) === toColor);
	let samesies = cornerDirectionList.filter(
		(d) => neighbors.get(d) !== toColor
	);
	/* inner cornerz */
	if (diffs.length >= 3) {
		return Tile({
			type: 'corner',
			colors: [color, toColor],
			direction: samesies[0],
		});
	}
	/* everything else */
	for (let direction of anyDirectionList) {
		let neighbor = neighbors.get(direction);
		if (neighbor && neighbor === toColor) {
			return Tile({
				type: cornerDirectionList.includes(direction) ? 'corner' : 'half',
				colors: [neighbor, color],
				direction,
			});
		}
	}
	return null;
};

export { Tile };
