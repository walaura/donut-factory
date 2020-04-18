import { AnyDirection } from '../../helper/direction';
import { makeCanvas } from '../helper/canvas-store';
import { Scaler } from './scaler';
import { Sprite } from './sprite';

export const SIZE = 40;
const rotateDirectionMap = {
	[AnyDirection.Top]: 0,
	[AnyDirection.Right]: Math.PI / 2,
	[AnyDirection.Bottom]: Math.PI,
	[AnyDirection.Left]: Math.PI / -2,
	[AnyDirection.TopLeft]: 0,
	[AnyDirection.TopRight]: Math.PI / -2,
	[AnyDirection.BottomLeft]: Math.PI / 2,
	[AnyDirection.BottomRight]: Math.PI,
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
	| { type: 'half'; colors: [TileColor, TileColor]; direction: AnyDirection }
	| {
			type: 'corner';
			colors: [TileColor, TileColor];
			direction: AnyDirection;
	  };

const Tile = (props: TileProps) => {
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

		if (props.direction !== AnyDirection.Top) {
			return Scaler(Tile({ ...props, direction: AnyDirection.Top }), {
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

		return canvas;
	});
};

export { Tile };
