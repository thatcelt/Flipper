import type { Canvas, SKRSContext2D, CanvasTextAlign, Image } from '@napi-rs/canvas';

import { colors } from '../../public/data/canvas-maps.json';
import type { Perk } from '../../generated/prisma/enums';

type Experience = {
  from: number;
  to: number;
};

export type ShopKey = 'shop-shop-other' | 'shop-shop-backgrounds' | 'shop-shop-frames';

export type DuelHistoryElement = 'duel-ice' | 'duel-wave' | 'duel-punch' | 'duel-dodge';

export type PerkKey = 'ice-perk' | 'deck-perk';

export type TopKey =
  | 'top-top-messages'
  | 'top-top-balance'
  | 'top-top-robs'
  | 'top-top-duels'
  | 'top-top-reputation'
  | 'top-top-level';

export type ShopThumbnail =
  | 'shop-clan'
  | 'shop-marry'
  | 'shop-aminodork'
  | 'shop-forest'
  | 'shop-porche'
  | 'shop-shrine'
  | 'shop-cherries'
  | 'shop-gachiakuta'
  | 'shop-guts'
  | 'shop-sniper'
  | 'shop-challenger'
  | 'shop-thorns'
  | 'shop-ocean'
  | 'shop-sewerslvt'
  | 'shop-city'
  | 'shop-clouds'
  | 'shop-winter'
  | 'shop-eva'
  | 'shop-ayanami'
  | 'shop-abstract'
  | 'shop-faces'
  | 'shop-centipede'
  | 'shop-ultrakill'
  | 'shop-cat'
  | 'shop-kirbies'
  | 'shop-yellow-card'
  | 'shop-red-card'
  | 'shop-green-card'
  | 'shop-blue-card'
  | 'shop-pink-card'
  | 'shop-purple-card'
  | 'shop-black-card'
  | 'shop-white-card'
  | 'shop-orange-card'
  | 'shop-white-frame'
  | 'shop-yellow-frame'
  | 'shop-red-frame'
  | 'shop-purple-frame'
  | 'shop-pink-frame'
  | 'shop-orange-frame'
  | 'shop-green-frame'
  | 'shop-blue-frame'
  | 'shop-black-frame';

export type BackgroundKey =
  | 'backgrounds-aminodork'
  | 'backgrounds-forest'
  | 'backgrounds-shrine'
  | 'backgrounds-cherries'
  | 'backgrounds-gachiakuta'
  | 'backgrounds-guts'
  | 'backgrounds-sniper'
  | 'backgrounds-challenger'
  | 'backgrounds-porche'
  | 'backgrounds-ultrakill'
  | 'backgrounds-cat'
  | 'backgrounds-kirbies'
  | 'backgrounds-beskonechnost'
  | 'backgrounds-postal'
  | 'backgrounds-lain'
  | 'backgrounds-escapist'
  | 'backgrounds-troll'
  | 'backgrounds-polughoul'
  | 'backgrounds-thorns'
  | 'backgrounds-ocean'
  | 'backgrounds-sewerslvt'
  | 'backgrounds-city'
  | 'backgrounds-clouds'
  | 'backgrounds-winter'
  | 'backgrounds-eva'
  | 'backgrounds-ayanami'
  | 'backgrounds-abstract'
  | 'backgrounds-faces'
  | 'backgrounds-centipede'
  | 'backgrounds-default';

export type CardColor =
  | 'cards-red'
  | 'cards-green'
  | 'cards-blue'
  | 'cards-purple'
  | 'cards-yellow'
  | 'cards-orange'
  | 'cards-black'
  | 'cards-white'
  | 'cards-gradient';

export type CasinoKey = 'casino-casino-win' | 'casino-casino-lose';

export type CasinoVariant =
  'casino-green-dork' | 'casino-green-love' | 'casino-purple-dork' | 'casino-purple-love';

export type ImageKey =
  | 'duel-health'
  | 'duel-shape'
  | 'duel-killed'
  | 'duel-killed-frame'
  | 'frames-profile-black'
  | 'frames-profile-white'
  | 'frames-profile-red'
  | 'frames-profile-blue'
  | 'frames-profile-purple'
  | 'frames-profile-pink'
  | 'frames-profile-yellow'
  | 'frames-profile-orange'
  | 'frames-profile-green'
  | 'frames-couple-red'
  | 'frames-couple-green'
  | 'frames-couple-blue'
  | 'frames-couple-purple'
  | 'frames-couple-pink'
  | 'frames-couple-yellow'
  | 'frames-couple-black'
  | 'frames-couple-white'
  | 'frames-couple-orange'
  | 'frames-clan-red'
  | 'frames-clan-green'
  | 'frames-clan-blue'
  | 'frames-clan-purple'
  | 'frames-clan-pink'
  | 'frames-clan-yellow'
  | 'frames-clan-black'
  | 'frames-clan-white'
  | 'frames-clan-orange'
  | BackgroundKey
  | CardColor
  | TopKey
  | ShopKey
  | ShopThumbnail
  | CasinoKey
  | CasinoVariant
  | DuelHistoryElement
  | PerkKey;

export type FontKey = 'Monocraft' | 'NotoSans-Regular' | 'Poppins Medium';
export type ColorKey = keyof typeof colors;
export type FrameKey =
  'orange' | 'red' | 'blue' | 'green' | 'yellow' | 'pink' | 'purple' | 'black' | 'white';

export type TopEntity = {
  avatar: string;
  nickname: string;
  value: number;
};

export type ShopEntity = {
  title: string;
  cost: number;
  id: number;
  thumbnail: ShopThumbnail;
};

export type LoadedCanvas = {
  canvas: Canvas;
  context: SKRSContext2D;
};

export type RoundBuilder = {
  context: SKRSContext2D;
  image: string | Image;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number | number[];
};

export type TextBuilder = {
  context: SKRSContext2D;
  text: string;
  size: number;
  x: number;
  y: number;
  color?: ColorKey;
  font?: FontKey;
  align?: CanvasTextAlign;
  maxWidth?: number;
};

export type ManyRoundsBuilder = {
  context: SKRSContext2D;
  images: string[];
  dots: { x: number; y: number }[];
  size: number;
  radius: number;
};

export type ExperienceBuilder = {
  context: SKRSContext2D;
  frame: FrameKey;
  from: number;
  to: number;
  maps: { size: number; x: number; y: number };
  bar: { x: number; y: number };
};

export type ProfileBuilder = {
  nickname: string;
  level: number;
  reputation: number;
  avatar: string;
  work: string;
  frame: FrameKey;
  experience: Experience;
  stats: {
    messages: number;
    robs: number;
    duels: number;
    prestige: number;
    ice: number;
    deck: number;
  };
  couple?: {
    nickname: string;
    avatar: string;
  };
  clan?: {
    name: string;
    avatar: string;
  };
  perk?: string;
  background?: BackgroundKey;
};

export type CardBuilder = {
  number: string;
  initials: string;
  date: string;
  balance: number;
  cash: number;
  color: CardColor;
  background?: BackgroundKey;
};

export type ClanBuilder = {
  name: string;
  avatar: string;
  frame: FrameKey;
  participants: number;
  level: number;
  chatLink: string;
  experience: Experience;
  top: {
    messages: string[];
    experience: string[];
  };
  background?: BackgroundKey;
};

export type TopBuilder = {
  key: TopKey;
  winners: TopEntity[];
  secondaries: TopEntity[];
};

export type ShopBuilder = {
  previous: string;
  next: string;
  key: ShopKey;
  elements: ShopEntity[];
};

export type CasinoBuilder = {
  key: CasinoKey;
  variants: CasinoVariant[];
  value: number;
};

export type CoupleBuilder = {
  users: {
    nickname: string;
    avatar: string;
  }[];
  level: number;
  experience: Experience;
  createdAt: string;
  kisses: number;
  streak: number;
  frame: FrameKey;
  background?: BackgroundKey;
};

export type DuelBuilder = {
  users: {
    nickname: string;
    avatar: string;
    health: number;
    perk?: Perk | null;
    stats: {
      deck: number;
      ice: number;
    };
  }[];
  history: DuelHistoryElement[];
  killed?: number;
};
