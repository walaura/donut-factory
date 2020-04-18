import { XY } from '../../helper/xy';
import { makeCanvas } from '../helper/canvas-store';
import { makeCanvasOrOnScreenCanvas } from '../helper/offscreen';
import cap from './img/cap.png';
import maskCorner from './img/mask-corner.png';
import maskSplit from './img/mask-split.png';
import road from './img/road.png';
import waterOverlay from './img/water-overlay.png';
import waterCornerOverlay from './img/water-corner-overlay.png';
import waterCornerOverlayOut from './img/water-corner-overlay-out.png';
import { drawScaled, ScalerProps } from './scaler';

export const SIZE = 40;
const IMAGE_SIZE = 40;
const OFFSET = (SIZE - IMAGE_SIZE) / 2;

const EMPTY = makeCanvasOrOnScreenCanvas(SIZE, SIZE);

const Sprites = {
	road,
	cap,
	maskCorner,
	waterCornerOverlay,
	waterCornerOverlayOut,
	maskSplit,
	waterOverlay,
};

export type SpriteKey = keyof typeof Sprites;

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

const Sprite = (key: SpriteKey) => {
	if (typeof Sprites[key] === 'string') {
		return EMPTY;
	}
	return makeCanvas({ width: SIZE, height: SIZE }, ['sprite', key])(
		(canvas) => {
			const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
			ctx.drawImage(Sprites[key], 0, 0, SIZE, SIZE);
			return canvas;
		}
	);
};

const drawSprite = (
	ctx: OffscreenCanvasRenderingContext2D,
	key: SpriteKey,
	sp: Omit<ScalerProps, 'memoId'>,
	pos: XY
) => {
	if (typeof Sprites[key] === 'string') {
		return;
	}
	let memoId = ['scaled-sprite', key];
	drawScaled(
		ctx,
		Sprite(key),
		{
			...sp,
			memoId,
		},
		pos
	);
};

export { Sprite, drawSprite };
