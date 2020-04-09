import { XY } from '../../helper/xy';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';

export const SIZE = 60;
const IMAGE_SIZE = 40;
const OFFSET = (SIZE - IMAGE_SIZE) / 2;

const EMPTY = makeCanvasOrOnScreenCanvas(SIZE, SIZE);

const Sprites = {
	road: require('./imgs/road.png'),
	cap: require('./imgs/cap.png'),
};

export type SpriteKey = keyof typeof Sprites;
export type MkSpriteProps = { rotate?: number; scale?: number };

let spriteStore: {
	[key in string]: { [key in number]: OffscreenCanvas };
} = {};
for (let key of Object.keys(Sprites)) {
	fetch(Sprites[key])
		.then((r) => r.blob())
		.then((b) => createImageBitmap(b))
		.then((bitmap) => {
			Sprites[key] = bitmap;
		})
		.catch((err) => {
			console.error(err);
		});
}

const mkSprite = (
	key: SpriteKey,
	{ rotate = 0, scale = 0 }: MkSpriteProps = {}
) => {
	if (typeof Sprites[key] === 'string') {
		return EMPTY;
	}
	if (!spriteStore[key]) {
		spriteStore[key] = {};
	}
	if (spriteStore[key][rotate]) {
		return spriteStore[key][rotate];
	}
	spriteStore[key][rotate] = new OffscreenCanvas(SIZE, SIZE);
	const ctx = spriteStore[key][rotate].getContext(
		'2d'
	) as OffscreenCanvasRenderingContext2D;

	ctx.clearRect(0, 0, SIZE, SIZE);

	ctx.setTransform();
	if (rotate) {
		ctx.translate(SIZE / 2, SIZE / 2);
		ctx.rotate(rotate);
		ctx.translate(SIZE / -2, SIZE / -2);
	}
	if (scale) {
		ctx.translate(SIZE / 2, SIZE / 2);
		ctx.scale(1 + scale / 2.5, 1 + scale / 2.5);
		ctx.translate(SIZE / -2, SIZE / -2);
	}

	ctx.drawImage(Sprites[key], OFFSET, OFFSET);

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	return spriteStore[key][rotate];
};

const mkDrawSprite = (ctx: OffscreenCanvasRenderingContext2D) => (
	key: SpriteKey,
	props: MkSpriteProps,
	pos: XY,
	zoom: number
) => {
	const diff = SIZE / IMAGE_SIZE;
	const paddedSize = zoom * diff;
	const offset = (paddedSize - zoom) / 2;
	ctx.drawImage(
		mkSprite(key, props),
		pos.x * zoom - offset,
		pos.y * zoom - offset,
		paddedSize,
		paddedSize
	);
};

export { mkSprite, mkDrawSprite };
