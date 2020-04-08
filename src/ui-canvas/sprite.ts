import { XY } from '../helper/xy';

export const SIZE = 60;
const IMAGE_SIZE = 40;
const OFFSET = (SIZE - IMAGE_SIZE) / 2;
const EMPTY = new OffscreenCanvas(SIZE, SIZE);

const Sprites = {
	road: require('./sprite/road.png'),
	cap: require('./sprite/cap.png'),
};

export type SpriteKey = keyof typeof Sprites;
export type MkSpriteProps = { rotate?: number };

let spriteStore: {
	[key in string]: { [key in number]: OffscreenCanvas };
} = {};
for (let key of Object.keys(Sprites)) {
	fetch(Sprites[key])
		.then((r) => r.blob())
		.then((b) => createImageBitmap(b))
		.then((bitmap) => {
			Sprites[key] = bitmap;
		});
}

const mkSprite = (key: SpriteKey, { rotate = 0 }: MkSpriteProps = {}) => {
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
	ctx.translate(SIZE / 2, SIZE / 2);
	ctx.rotate(rotate);
	ctx.translate(SIZE / -2, SIZE / -2);

	ctx.drawImage(Sprites[key], OFFSET, OFFSET);

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	return spriteStore[key][rotate];
};

const mkDrawSprite = (ctx: OffscreenCanvasRenderingContext2D) => (
	key: SpriteKey,
	props: MkSpriteProps,
	pos: XY,
	scale: number = 1
) => {
	const offset = SIZE / (2 / scale);
	const size = SIZE * scale;
	ctx.drawImage(
		mkSprite(key, props),
		pos.x - offset,
		pos.y - offset,
		size,
		size
	);
};

export { mkSprite, mkDrawSprite };
