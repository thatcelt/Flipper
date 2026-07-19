import { file } from 'bun';
import { createCanvas, loadImage, GlobalFonts, Image } from '@napi-rs/canvas';

import keys from '../../public/data/keys.json';
import maps from '../../public/data/canvas-maps.json';
import { colors } from '../../public/data/canvas-maps.json';
import { PERK_MAP } from '../constants';
import type {
  CardBuilder,
  CasinoBuilder,
  ClanBuilder,
  CoupleBuilder,
  DuelBuilder,
  ExperienceBuilder,
  ImageKey,
  LoadedCanvas,
  ManyRoundsBuilder,
  ProfileBuilder,
  RoundBuilder,
  ShopBuilder,
  TextBuilder,
  TopBuilder,
} from '../types/canvas';
import { getAvatarUrl } from './helpers';

const images: Map<ImageKey, Image> = new Map();

keys.fonts.forEach((font) => {
  GlobalFonts.registerFromPath(font.path, font.key);
});

const loadCanvas = (key: ImageKey, background: ImageKey = 'backgrounds-default'): LoadedCanvas => {
  const canvas = createCanvas(700, 700);
  const context = canvas.getContext('2d');

  context.drawImage(images.get(background)!, 0, 0);
  context.drawImage(images.get(key)!, 0, 0);

  return { canvas, context };
};

const round = async (builder: RoundBuilder): Promise<void> => {
  builder.context.save();
  builder.context.beginPath();
  builder.context.roundRect(builder.x, builder.y, builder.width, builder.height, builder.radius);
  builder.context.clip();

  try {
    builder.context.drawImage(
      builder.image instanceof Image ? builder.image : await loadImage(builder.image),
      builder.x,
      builder.y,
      builder.width,
      builder.height
    );
  } catch {}
  builder.context.restore();
};

const manyRounds = async (builder: ManyRoundsBuilder): Promise<void> => {
  for (let i = 0; i < builder.images.length; i++) {
    const { x, y } = builder.dots[i]!;
    const image = builder.images[i]!;

    if (!image) continue;

    await round({
      context: builder.context,
      image,
      x,
      y,
      width: builder.size,
      height: builder.size,
      radius: builder.radius,
    });
  }
};

const text = ({ context, text, size, x, y, color, font, align, maxWidth }: TextBuilder): void => {
  context.font = `${size}px ${font || 'Monocraft'}`;
  context.textAlign = align || 'left';
  context.fillStyle = colors[color || 'white'];
  context.fillText(text, x, y, maxWidth);
};

const experience = ({ context, frame, from, to, maps, bar }: ExperienceBuilder) => {
  context.fillStyle = colors[frame];
  context.beginPath();

  context.roundRect(bar.x, bar.y, (from / to) * 463, 54, [8, 0, 0, 8]);
  context.fill();

  text({
    context,
    text: `${from}/${to}`,
    align: 'center',
    ...maps,
  });
};

export const profile = async (builder: ProfileBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas(`frames-profile-${builder.frame}`, builder.background);

  await round({ context, image: builder.avatar, ...maps.profile.avatar });
  text({ context, text: builder.nickname, ...maps.profile.nickname });
  text({ context, text: builder.work, ...maps.profile.work });
  text({ context, text: builder.level.toString(), ...maps.profile.level });
  text({ context, text: builder.reputation.toString(), ...maps.profile.reputation });

  [builder.stats.deck, builder.stats.ice].forEach((stat, index) => {
    text({
      context,
      text: stat.toString(),
      ...maps.profile.stats,
      x: maps.profile.stats.x + index * maps.profile.statsStep,
    });
  });

  experience({
    context,
    frame: builder.frame,
    from: builder.experience.from,
    to: builder.experience.to,
    maps: maps.profile.experience,
    bar: maps.profile.bar,
  });

  text({ context, text: builder.stats.messages.toString(), ...maps.profile.messages });
  text({ context, text: builder.stats.robs.toString(), ...maps.profile.robs });
  text({ context, text: builder.stats.duels.toString(), ...maps.profile.duels });
  text({ context, text: builder.stats.prestige.toString(), ...maps.profile.prestiges });

  let courpleCaption = 'У вас нет пары';

  if (builder.couple) {
    await round({
      context,
      image: getAvatarUrl(builder.couple.avatar),
      ...maps.profile.coupleAvatar,
    });
    courpleCaption = `В паре с ${builder.couple.nickname}`;
  }

  text({ context, text: courpleCaption, align: 'center', ...maps.profile.coupleCaption });

  let clanCaption = 'У вас нет клана';

  if (builder.clan) {
    await round({ context, image: builder.clan.avatar, ...maps.profile.clanAvatar });
    clanCaption = `В клане ${builder.clan.name}`;
  }

  text({ context, text: clanCaption, align: 'center', ...maps.profile.clanCaption });

  return canvas.toBuffer('image/jpeg', 85);
};

export const card = (builder: CardBuilder): Buffer => {
  const { canvas, context } = loadCanvas(builder.color, builder.background);

  builder.number.split(' ').forEach((part, index) => {
    text({
      context,
      text: part,
      font: 'Poppins Medium',
      x: 139 + index * 98,
      ...maps.card.number,
    });
  });

  text({ context, text: builder.initials, font: 'NotoSans-Regular', ...maps.card.initials });
  text({ context, text: builder.date, font: 'Poppins Medium', ...maps.card.date });
  text({ context, text: `${builder.balance} фликов`, ...maps.card.balance });
  text({ context, text: `${builder.cash} фликов`, ...maps.card.cash });

  return canvas.toBuffer('image/jpeg', 85);
};

export const clan = async (builder: ClanBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas(`frames-clan-${builder.frame}`, builder.background);

  await round({ context, image: builder.avatar, ...maps.clan.avatar });

  text({ context, text: builder.name, ...maps.clan.name });
  text({ context, text: builder.participants.toString(), ...maps.clan.participants });
  text({ context, text: builder.level.toString(), ...maps.clan.level });
  text({ context, text: builder.chatLink, ...maps.clan.chatLink });

  experience({
    context,
    frame: builder.frame,
    from: builder.experience.from,
    to: builder.experience.to,
    maps: maps.clan.experience,
    bar: maps.clan.bar,
  });

  await manyRounds({
    context,
    images: builder.top.messages,
    dots: maps.clan.dots.messages,
    size: 88,
    radius: 100,
  });
  await manyRounds({
    context,
    images: builder.top.experience,
    dots: maps.clan.dots.experience,
    size: 88,
    radius: 100,
  });

  return canvas.toBuffer('image/jpeg', 85);
};

export const top = async (builder: TopBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas(builder.key);

  const x = maps.top.x[builder.key as keyof typeof maps.top.x]; // the fuck

  await manyRounds({
    context,
    images: builder.winners.map((winner) => winner.avatar),
    dots: maps.top.dots.winners,
    size: 88,
    radius: 100,
  });
  await manyRounds({
    context,
    images: builder.secondaries.map((secondary) => secondary.avatar),
    dots: maps.top.dots.secondaries,
    size: 68,
    radius: 100,
  });

  for (let i = 0; i < builder.winners.length; i++) {
    const { nickname, value } = builder.winners[i]!;
    const { x, y } = maps.top.dots.meta[i]!;

    text({
      context,
      font: 'NotoSans-Regular',
      text: nickname,
      size: 17,
      x: x + 89 / 2,
      y,
      align: 'center',
    });

    text({
      context,
      text: value.toString(),
      size: 17,
      x: x + 89 / 2,
      y: y + 48,
      align: 'center',
    });
  }

  for (let i = 0; i < builder.secondaries.length; i++) {
    const { nickname, value } = builder.secondaries[i]!;

    text({
      context,
      text: nickname,
      font: 'NotoSans-Regular',
      ...maps.top.secondaries.nickname,
      y: maps.top.secondaries.nickname.y + 126 * i,
    });

    text({
      context,
      text: value.toString(),
      x,
      ...maps.top.secondaries.value,
      y: maps.top.secondaries.value.y + 126 * i,
    });
  }

  return canvas.toBuffer('image/jpeg', 85);
};

export const market = async (builder: ShopBuilder) => {
  const { canvas, context } = loadCanvas(builder.key);

  text({ context, text: builder.previous, ...maps.shop.previous });
  text({ context, text: builder.next, ...maps.shop.next });

  let iter = 0;

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const element = builder.elements[iter]!;

      if (!element) continue;

      const x = maps.shop.thumbnail.x + 308 * j;
      const y = maps.shop.thumbnail.y + 249 * i;

      await round({
        context,
        image: images.get(element.thumbnail)!,
        ...maps.shop.thumbnail,
        x,
        y,
      });

      text({ context, text: element.title, x, y: y + 204, size: 12 });
      text({ context, text: element.id.toString(), ...maps.shop.id, x: 330 + 308 * j, y: y + 205 });
      text({
        context,
        text: `${element.cost} фликов`,
        size: 12,
        x,
        y: y + 220,
      });

      iter++;
    }
  }

  return canvas.toBuffer('image/jpeg', 85);
};

export const casino = async ({ key, variants, value }: CasinoBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas(key);

  for (let i = 0; i < variants.length; i++) {
    context.drawImage(images.get(variants[i]!)!, 149 + 160 * i, 241);
  }

  text({
    context,
    text: `${key == 'casino-casino-win' ? value * 2 : value} фликов`,
    ...maps.casino,
    align: 'center',
  });

  return canvas.toBuffer('image/jpeg', 85);
};

export const couple = async (builder: CoupleBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas(`frames-couple-${builder.frame}`, builder.background);

  for (let i = 0; i < builder.users.length; i++) {
    const { nickname, avatar } = builder.users[i]!;

    await round({ context, image: getAvatarUrl(avatar), ...maps.couple.image, x: 125 + 301 * i });
    text({
      context,
      text: nickname,
      ...maps.couple.nickname,
      x: 140 + (124 + 602 * i) / 2,
      align: 'center',
    });
  }

  text({ context, text: builder.createdAt, ...maps.couple.createdAt });
  text({ context, text: builder.kisses.toString(), ...maps.couple.kisses });
  text({ context, text: builder.streak.toString(), ...maps.couple.streak });
  text({ context, text: builder.level.toString(), ...maps.couple.level });

  experience({
    context,
    frame: builder.frame,
    from: builder.experience.from,
    to: builder.experience.to,
    maps: maps.couple.experience,
    bar: maps.couple.bar,
  });

  return canvas.toBuffer('image/jpeg', 85);
};

export const fight = async ({ users, history, killed }: DuelBuilder): Promise<Buffer> => {
  const { canvas, context } = loadCanvas('duel-shape');
  const health = images.get('duel-health')!;

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!;
    const x = 124 + 301 * i;
    const healthX = 92 + 301 * i;

    for (let j = 0; j < user.health; j++) {
      context.drawImage(health, healthX - 9 + j * 55, maps.duel.user.health.y);
    }

    await round({ context, image: user.avatar, ...maps.duel.user.avatar, x: x + 1 });
    text({
      context,
      text: user.nickname,
      x: x + 76,
      ...maps.duel.user.nickname,
      align: 'center',
    });
    text({ context, text: `Дека: ${user.stats.deck}`, x, ...maps.duel.user.deck });
    text({ context, text: `Лёд: ${user.stats.ice}`, x, ...maps.duel.user.deck, y: 457 });

    if (user.perk) {
      await round({
        context,
        image: images.get(PERK_MAP[user.perk])!,
        ...maps.duel.user.perk,
        x: 247 + 301 * i,
      });
    }
  }

  const truncated = history.slice(-9);

  for (let i = 0; i < truncated.length; i++) {
    const element = truncated[i]!;

    context.drawImage(images.get(element)!, 107 + i * 55, 510, 45, 45);
  }

  if (killed) {
    context.drawImage(images.get('duel-killed')!, 90 + 301 * (killed - 1), 44);
    context.drawImage(images.get('duel-killed-frame')!, 0, 0);
  }

  return canvas.toBuffer('image/jpeg', 85);
};

export const loadImages = async () => {
  for (const asset of keys.assets)
    images.set(
      asset.key as ImageKey,
      await loadImage(Buffer.from(await file(asset.path).arrayBuffer()))
    );
};
