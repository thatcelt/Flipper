import { createCanvas, Image, loadImage, registerFont } from 'canvas';
import { readFile } from 'node:fs/promises';

import * as settings from '../../public/data/settings.json';
import {
  CanvasContext,
  CasinoImageBuilder,
  ClanImageBuilder,
  CoupleImageBuilder,
  CreditCardBuilder,
  DrawImageArrayConfig,
  DrawRoundedImageConfig,
  DrawTextConfig,
  ImagesMap,
  ProfileImageBuilder,
  ShopImageBuilder,
  TopImageBuilder,
} from '../schemas/canvas';
import {
  clanDots,
  colors,
  topDots,
  topHorizontalMap,
} from '../../public/data/constants.json';

const images: Map<ImagesMap, Image> = new Map<ImagesMap, Image>();

settings.fonts.forEach((font) =>
  registerFont(font.path, { family: font.family }),
);

export const loadImages = async () => {
  for (const asset of settings.assets)
    images.set(
      asset.key as ImagesMap,
      await loadImage(await readFile(asset.path)),
    );
};

export const loadCanvas = async (
  image: ImagesMap,
  background: string = 'profile-default-background',
): Promise<CanvasContext> => {
  const canvas = createCanvas(700, 700);
  const ctx = canvas.getContext('2d');

  const backgroundImage = images.get(background as ImagesMap)!;
  ctx.drawImage(
    backgroundImage,
    0,
    0,
    Math.max(backgroundImage.width, 700),
    700,
  );

  ctx.drawImage(images.get(image)!, 0, 0, 700, 700);

  return {
    canvas,
    ctx,
  };
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
  config.ctx.fillStyle = config.color || colors.white;
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

export const drawProfile = async (
  builder: ProfileImageBuilder,
): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(
    `frames-profile-${builder.frame}` as ImagesMap,
    builder.background,
  );
  const centeredWidth = 29 + 463 / 2;

  drawText({ ctx, text: builder.nickname, size: 22, x: 193, y: 60 });
  drawText({
    ctx,
    text: builder.work,
    size: 17,
    x: 268,
    y: 95,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.level.toString(),
    size: 17,
    x: 261,
    y: 124,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.reputation.toString(),
    size: 17,
    x: 299,
    y: 152,
    font: 'italic',
  });

  ctx.fillStyle = colors[builder.frame as keyof typeof colors];
  ctx.beginPath();

  ctx.roundRect(
    29,
    216,
    (builder.experience.from / builder.experience.to) * 463,
    54,
    [7, 0, 0, 7],
  );
  ctx.fill();

  drawText({
    ctx,
    text: `${builder.experience.from}/${builder.experience.to}`,
    size: 17,
    x: centeredWidth,
    y: 249,
    color: '#FFFFFF',
    align: 'center',
  });

  drawText({
    ctx,
    text: builder.stats.messages.toString(),
    size: 14,
    x: 239,
    y: 330,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.stats.robs.toString(),
    size: 14,
    x: 200,
    y: 374,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.stats.duels.toString(),
    size: 14,
    x: 216,
    y: 417,
    font: 'italic',
  });

  if (builder.hasCouple) {
    var coupleCaption = `В паре с ${builder.hasCouple.nickname}`;

    await drawRoundedImage({
      ctx,
      image: builder.hasCouple.avatar,
      dx: 397,
      dy: 477,
      width: 60,
      height: 60,
      radius: 100,
    });
  } else {
    var coupleCaption = 'У вас нету пары';
  }

  drawText({
    ctx,
    text: coupleCaption,
    size: 17,
    x: centeredWidth,
    y: 515,
    font: 'regular',
    color: '#FFFFFF',
    align: 'center',
  });

  if (builder.hasClan) {
    var clanCaption = `В клане ${builder.hasClan.name}`;

    await drawRoundedImage({
      ctx,
      image: builder.hasClan.avatar,
      dx: 396,
      dy: 589,
      width: 62,
      height: 62,
      radius: 100,
    });
  } else {
    var clanCaption = 'У вас нету клана';
  }

  drawText({
    ctx,
    text: clanCaption,
    size: 17,
    x: centeredWidth,
    y: 627,
    font: 'regular',
    color: '#FFFFFF',
    align: 'center',
  });

  if (builder.avatar)
    try {
      await drawRoundedImage({
        ctx,
        image: builder.avatar,
        dx: 28,
        dy: 36,
        width: 150,
        height: 150,
        radius: 12,
      });
    } catch {}

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawCreditCard = async (
  builder: CreditCardBuilder,
): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(
    'profile-credit-card',
    builder.background,
  );

  ctx.font = '25px Poppins Medium';
  ctx.fillStyle = '#FFFFFF';
  const splittedCardNumber = builder.cardNumber.split(' ');

  for (let i = 0; i < 4; i++) {
    ctx.fillText(splittedCardNumber[i], 139 + i * 98, 407);
  }

  ctx.font = '20px Poppins Medium';
  ctx.fillText(builder.initials, 138, 460);
  ctx.fillText(builder.date, 500, 460);

  drawText({
    ctx,
    text: `${builder.balance} гемов`,
    size: 20,
    x: 224,
    y: 536,
    font: 'italic',
  });
  drawText({
    ctx,
    text: `${builder.cash} гемов`,
    size: 20,
    x: 245,
    y: 568,
    font: 'italic',
  });

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawClan = async (builder: ClanImageBuilder): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(
    `frames-clan-${builder.frame}` as ImagesMap,
    builder.background,
  );
  const centeredWidth = 29 + 465 / 2;

  await drawRoundedImage({
    ctx,
    image: builder.avatar,
    dx: 28,
    dy: 21,
    width: 150,
    height: 150,
    radius: 11,
  });

  drawText({ ctx, text: builder.title, size: 22, x: 193, y: 40 });
  drawText({
    ctx,
    text: builder.participants.toString(),
    size: 17,
    x: 413,
    y: 80,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.level.toString(),
    size: 17,
    x: 319,
    y: 109,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.chatTitle,
    size: 17,
    x: 308,
    y: 137,
    font: 'italic',
  });

  ctx.fillStyle = colors[builder.frame as keyof typeof colors];
  ctx.beginPath();

  ctx.roundRect(
    29,
    197,
    (builder.experience.from / builder.experience.to) * 465,
    54,
    [7, 0, 0, 7],
  );
  ctx.fill();

  drawText({
    ctx,
    text: `${builder.experience.from}/${builder.experience.to}`,
    size: 17,
    x: centeredWidth,
    y: 230,
    font: 'regular',
    color: '#FFFFFF',
    align: 'center',
  });

  await drawImageArray({
    ctx,
    images: builder.topMessages,
    dots: clanDots.messages,
    size: 88,
    radius: 100,
  });
  await drawImageArray({
    ctx,
    images: builder.topExperience,
    dots: clanDots.experience,
    size: 88,
    radius: 100,
  });

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawTop = async (builder: TopImageBuilder): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(builder.type);
  const secondaryWidth = topHorizontalMap[builder.type];

  await drawImageArray({
    ctx,
    images: builder.winners.map((winner) => winner.avatar),
    dots: topDots.winners,
    size: 88,
    radius: 100,
  });
  await drawImageArray({
    ctx,
    images: builder.secondary.map((winner) => winner.avatar),
    dots: topDots.secondary,
    size: 67,
    radius: 100,
  });

  for (let i = 0; i < builder.winners.length; i++) {
    const profile = builder.winners[i];
    const { x, y } = topDots.winnersMeta[i];

    drawText({
      ctx,
      text: profile.nickname,
      size: 17,
      x: x + 89 / 2,
      y,
      align: 'center',
    });
    drawText({
      ctx,
      text: profile.value.toString(),
      size: 17,
      x: x + 89 / 2,
      y: y + 48,
      font: 'italic',
      align: 'center',
    });
  }

  for (let i = 0; i < builder.secondary.length; i++) {
    const profile = builder.secondary[i];

    drawText({
      ctx,
      text: profile.nickname,
      size: 14,
      x: 148,
      y: 347 + 126 * i,
      font: 'medium',
    });
    drawText({
      ctx,
      text: profile.value.toString(),
      size: 14,
      x: secondaryWidth,
      y: 370 + 126 * i,
      font: 'italic',
    });
  }

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawShop = async (builder: ShopImageBuilder): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(`shop-shop-${builder.type}`);

  let iter = 0;

  drawText({
    ctx,
    text: builder.previousPage,
    size: 13,
    x: 43,
    y: 682,
    font: 'italic',
  });
  drawText({
    ctx,
    text: builder.nextPage,
    size: 13,
    x: 650,
    y: 682,
    font: 'italic',
  });

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const element = builder.elements[iter];
      if (!element) continue;

      iter++;
      const fixedX = 56 + 308 * j;
      const fixedY = 172 + 249 * i;

      await drawRoundedImage({
        ctx,
        image: images.get(element.thumbnail)!,
        dx: fixedX,
        dy: fixedY,
        width: 279,
        height: 187,
        radius: [10, 10, 13, 10],
      });

      drawText({
        ctx,
        text: element.title,
        size: 12,
        x: fixedX,
        y: fixedY + 204,
        font: 'medium',
      });
      drawText({
        ctx,
        text: element.id.toString(),
        size: 12,
        x: 330 + 308 * j,
        y: fixedY + 204,
        font: 'italic',
      });
      drawText({
        ctx,
        text: `${element.cost} гемов`,
        size: 12,
        x: fixedX,
        y: fixedY + 220,
        font: 'italic',
      });
    }
  }

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawCasino = async (
  builder: CasinoImageBuilder,
): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(builder.type);

  for (let i = 0; i < builder.variants.length; i++) {
    ctx.drawImage(images.get(builder.variants[i])!, 149 + 160 * i, 241);
  }

  drawText({
    ctx,
    text: `${builder.value} гемов`,
    size: 22,
    x: 245 + 208 / 2,
    y: 510,
    font: 'italic',
    align: 'center',
  });

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};

export const drawCouple = async (
  builder: CoupleImageBuilder,
): Promise<Buffer> => {
  const { canvas, ctx } = await loadCanvas(
    `frames-couple-${builder.frame}` as ImagesMap,
    builder.background,
  );

  for (let i = 0; i < 2; i++) {
    const user = builder.users[i];
    await drawRoundedImage({
      ctx,
      image: user.avatar,
      dx: 124 + 301 * i,
      dy: 127,
      width: 149,
      height: 149,
      radius: 100,
    });
    drawText({
      ctx,
      text: user.nickname,
      size: 17,
      x: 140 + (124 + 602 * i) / 2,
      y: 315,
      font: 'medium',
      align: 'center',
    });
  }

  drawText({
    ctx,
    text: builder.createdAt,
    size: 14,
    x: 294,
    y: 445,
    font: 'regular',
  });
  drawText({
    ctx,
    text: builder.kissesMade.toString(),
    size: 14,
    x: 302,
    y: 478,
    font: 'regular',
  });
  drawText({
    ctx,
    text: builder.kissesStreak.toString(),
    size: 14,
    x: 349,
    y: 512,
    font: 'regular',
  });
  drawText({
    ctx,
    text: builder.level.toString(),
    size: 17,
    x: 374,
    y: 315,
    font: 'medium',
  });

  ctx.fillStyle = colors[builder.frame as keyof typeof colors];
  ctx.beginPath();

  ctx.roundRect(
    118,
    345,
    (builder.experience.from / builder.experience.to) * 463,
    54,
    [7, 0, 0, 7],
  );
  ctx.fill();

  drawText({
    ctx,
    text: `${builder.experience.from}/${builder.experience.to}`,
    size: 17,
    x: 118 + 466 / 2,
    y: 378,
    font: 'regular',
    align: 'center',
  });

  drawText({
    ctx,
    text: `"${builder.answer}"`,
    size: 14,
    x: 160,
    y: 559,
    font: 'italic',
    align: 'left',
    maxWidth: 278,
  });

  return canvas.toBuffer('image/png', { compressionLevel: 0 });
};
