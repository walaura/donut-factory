import sum from 'hash-sum';
import { XY } from '../../helper/xy';
import { CanvasRendererStateViewport } from '../../wk/canvas.defs';
import { mkWorldToScreen } from '../helper/latlong';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import { makeCanvas } from '../helper/canvas-store';

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
	return makeCanvas(
		{ width: SIZE, height: SIZE },
		{ key, rotate, scale }
	)((canvas) => {
		const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

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

		return canvas;
	});
};

const mkDrawSprite = (ctx: OffscreenCanvasRenderingContext2D) => (
	key: SpriteKey,
	props: MkSpriteProps,
	pos: XY,
	{ zoom, viewport }: CanvasRendererStateViewport
) => {
	let gameWorldToViewport = mkWorldToScreen({ zoom, viewport });
	const diff = SIZE / IMAGE_SIZE;
	const paddedSize = zoom * diff;
	const offset = (paddedSize - zoom) / 2;
	let translatedPos = gameWorldToViewport(pos);
	ctx.drawImage(
		mkSprite(key, props),
		translatedPos.x - offset,
		translatedPos.y - offset,
		paddedSize,
		paddedSize
	);
};

export { mkSprite, mkDrawSprite };
