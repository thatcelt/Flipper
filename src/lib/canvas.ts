import { Image, loadImage, registerFont } from 'canvas';
import { readFile } from 'node:fs/promises';

import * as settings from '../../public/data/settings.json';
import {
  DrawImageArrayConfig,
  DrawRoundedImageConfig,
  DrawTextConfig,
  ImagesMap,
} from '../schemas/canvas';
import { COLORS } from '../constants';

const images: Map<ImagesMap, Image> = new Map<ImagesMap, Image>();

settings.fonts.forEach((font) =>
  registerFont(font.path, { family: font.family }),
);

export const loadImages = async () => {
  settings.assets.forEach(async (asset) =>
    images.set(
      asset.key as ImagesMap,
      await loadImage(await readFile(asset.path)),
    ),
  );
};

const drawRoundedImage = async (
  config: DrawRoundedImageConfig,
): Promise<void> => {
  config.ctx.save();
  config.ctx.beginPath();
  config.ctx.roundRect(
    config.dx + 1,
    config.dy + 1,
    config.width,
    config.height,
    config.radius,
  );
  config.ctx.clip();
  config.ctx.drawImage(
    config.image instanceof Image
      ? config.image
      : await loadImage(config.image),
    config.dx,
    config.dy,
    config.width,
    config.height,
  );
  config.ctx.restore();
};

const drawText = (config: DrawTextConfig): void => {
  const font = config.font || 'medium';

  config.ctx.font = `${config.size}px Ubuntu Sans Mono ${font.charAt(0).toUpperCase() + font.slice(1)}`;
  config.ctx.textAlign = config.align || 'left';
  config.ctx.fillStyle = config.color || COLORS.white;
  config.ctx.fillText(config.text, config.x, config.y, config.maxWidth);
};

const drawImageArray = async (config: DrawImageArrayConfig): Promise<void> => {
  for (let i = 0; i < (config.iter || 3); i++) {
    const { x, y } = config.dots[i];
    const avatar = config.images[i];

    if (!avatar) continue;

    await drawRoundedImage({
      ctx: config.ctx,
      image: avatar,
      dx: x,
      dy: y,
      width: config.size,
      height: config.size,
      radius: config.radius,
    });
  }
};
