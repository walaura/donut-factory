import { makeCanvas } from '../helper/canvas-store';
import { Sprite } from './sprite';
import { Direction } from '../../helper/xy';
import { Scaler } from './scaler';

export const SIZE = 40;
const rotateDirectionMap = {
	right: Math.PI / 2,
	left: Math.PI / -2,
	bottom: Math.PI,
};
const colors = {
	grass: '#d8f2c4',
	water: '#d9fcfc',
	dirt: '#b8b3ae',
	HOTPINK4DEBUG: 'hotpink',
};
type TileColor = keyof typeof colors;

export type TileProps =
	| { type: 'full'; color: TileColor }
	| { type: 'half'; colors: [TileColor, TileColor]; direction: Direction }
	| { type: 'corner'; colors: [TileColor, TileColor]; direction: Direction };

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

		if (props.direction !== 'top') {
			return Scaler(Tile({ ...props, direction: 'top' }), {
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
		ctx.fillStyle = colors[innerColor];
		ctx.fillRect(0, 0, SIZE, SIZE);

		ctx.globalCompositeOperation = 'destination-over';
		ctx.fillStyle = colors[outerColor];
		ctx.fillRect(0, 0, SIZE, SIZE);

		return canvas;
	});
};

export { Tile };
