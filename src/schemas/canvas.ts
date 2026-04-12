import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { z } from 'zod';
import { colors } from '../../public/data/constants.json';

export const ImagesEnum = z.enum([
  'casino-lose',
  'casino-win',
  'casino-green-dork',
  'casino-green-love',
  'casino-purple-dork',
  'casino-purple-love',
  'profile-credit-card',
  'profile-default-background',
  'shop-blue',
  'shop-green',
  'shop-orange',
  'shop-pink',
  'shop-purple',
  'shop-red',
  'shop-shop-backgrounds',
  'shop-shop-frames',
  'shop-shop-other',
  'shop-yellow',
  'shop-clan',
  'shop-marry',
  'shop-aminodork',
  'shop-cat',
  'shop-dodge',
  'shop-forest',
  'shop-guts',
  'shop-kirbies',
  'shop-minecraft',
  'shop-porche',
  'shop-shrine',
  'shop-sniper',
  'shop-ultrakill',
  'shop-watchman',
  'top-balance',
  'top-duels',
  'top-messages',
  'top-robs',
  'frames-clan-blue',
  'frames-clan-green',
  'frames-clan-orange',
  'frames-clan-pink',
  'frames-clan-purple',
  'frames-clan-red',
  'frames-clan-yellow',
  'frames-couple-blue',
  'frames-couple-green',
  'frames-couple-orange',
  'frames-couple-pink',
  'frames-couple-purple',
  'frames-couple-red',
  'frames-couple-yellow',
  'frames-profile-blue',
  'frames-profile-green',
  'frames-profile-orange',
  'frames-profile-pink',
  'frames-profile-purple',
  'frames-profile-red',
  'frames-profile-yellow',
  'background-aminodork',
  'background-cat',
  'background-dodge',
  'background-forest',
  'background-guts',
  'background-kirbies',
  'background-minecraft',
  'background-porche',
  'background-shrine',
  'background-sniper',
  'background-ultrakill',
  'background-watchman',
]);

export const FontsEnum = z.enum(['medium', 'regular', 'italic']);

export const AlignEnum = z.enum(['left', 'center', 'right', 'end', 'start']);

export const TopsEnum = z.enum([
  'top-messages',
  'top-robs',
  'top-duels',
  'top-balance',
]);

export const ShopsEnum = z.enum(['backgrounds', 'frames', 'other']);

export const CasinoTypesEnum = z.enum(['casino-win', 'casino-lose']);

export const CasinoVariantsEnum = z.enum([
  'casino-green-dork',
  'casino-purple-dork',
  'casino-green-love',
  'casino-purple-love',
]);

export const GambleTypesEnum = z.enum(['won', 'lose']);

export const DrawRoundedImageConfigSchema = z.object({
  ctx: z.instanceof(CanvasRenderingContext2D),
  image: z.union([z.string(), z.instanceof(Image)]),
  dx: z.number(),
  dy: z.number(),
  width: z.number(),
  height: z.number(),
  radius: z.union([z.number(), z.array(z.number())]),
});

export const DrawTextConfigSchema = z.object({
  ctx: z.instanceof(CanvasRenderingContext2D),
  text: z.string(),
  size: z.number(),
  x: z.number(),
  y: z.number(),
  font: FontsEnum.optional(),
  color: z
    .enum(Object.keys(colors) as [keyof typeof colors, ...string[]])
    .optional(),
  align: AlignEnum.optional(),
  maxWidth: z.number().optional(),
});

export const DotsMapSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const DrawImageArrayConfigSchema = z.object({
  ctx: z.instanceof(CanvasRenderingContext2D),
  images: z.array(z.string()),
  dots: z.array(DotsMapSchema),
  size: z.number(),
  radius: z.number(),
  iter: z.number().optional(),
});

export const CanvasContextSchema = z.object({
  canvas: z.instanceof(Canvas),
  ctx: z.instanceof(CanvasRenderingContext2D),
});

export const ProfileImageBuilderSchema = z.object({
  nickname: z.string(),
  level: z.number(),
  reputation: z.number(),
  avatar: z.string(),
  background: z.string().optional(),
  work: z.string(),
  frame: z.string(),
  experience: z.object({
    from: z.number(),
    to: z.number(),
  }),
  stats: z.object({
    messages: z.number(),
    robs: z.number(),
    duels: z.number(),
  }),
  hasCouple: z
    .object({
      nickname: z.string(),
      avatar: z.string(),
    })
    .optional(),
  hasClan: z
    .object({
      name: z.string(),
      avatar: z.string(),
    })
    .optional(),
});

export const CreditCardImageBuilderSchema = z.object({
  cardNumber: z.string(),
  initials: z.string(),
  date: z.string(),
  balance: z.number(),
  cash: z.number(),
  background: z.string().optional(),
});

export const ClanImageBuilderSchema = z.object({
  title: z.string(),
  avatar: z.string(),
  participants: z.number(),
  level: z.number(),
  chatTitle: z.string(),
  experience: z.object({
    from: z.number(),
    to: z.number(),
  }),
  topMessages: z.array(z.string()),
  topExperience: z.array(z.string()),
  frame: z.string(),
  background: z.string().optional(),
});

export const TopEntitySchema = z.object({
  avatar: z.string(),
  nickname: z.string(),
  value: z.number(),
});

export const TopImageBuilderSchema = z.object({
  type: TopsEnum,
  winners: z.array(TopEntitySchema),
  secondary: z.array(TopEntitySchema),
});

export const ShopElementSchema = z.object({
  thumbnail: ImagesEnum,
  title: z.string(),
  cost: z.number(),
  id: z.number(),
});

export const ShopImageBuilderSchema = z.object({
  previousPage: z.string(),
  nextPage: z.string(),
  type: ShopsEnum,
  elements: z.array(ShopElementSchema),
});

export const CasinoImageBuilderSchema = z.object({
  type: CasinoTypesEnum,
  variants: z.array(CasinoVariantsEnum),
  value: z.number(),
});

export const CoupleImageBuilderSchema = z.object({
  users: z.array(
    z.object({
      avatar: z.string(),
      nickname: z.string(),
    }),
  ),
  createdAt: z.string(),
  kissesMade: z.number(),
  kissesStreak: z.number(),
  level: z.number(),
  experience: z.object({
    from: z.number(),
    to: z.number(),
  }),
  answer: z.string(),
  frame: z.string(),
  background: z.string().optional(),
});

export type ImagesMap = z.infer<typeof ImagesEnum>;
export type FontsMap = z.infer<typeof FontsEnum>;
export type DrawRoundedImageConfig = z.infer<
  typeof DrawRoundedImageConfigSchema
>;
export type DrawTextConfig = z.infer<typeof DrawTextConfigSchema>;
export type DrawImageArrayConfig = z.infer<typeof DrawImageArrayConfigSchema>;
export type CanvasContext = z.infer<typeof CanvasContextSchema>;
export type ProfileImageBuilder = z.infer<typeof ProfileImageBuilderSchema>;
export type CreditCardBuilder = z.infer<typeof CreditCardImageBuilderSchema>;
export type ClanImageBuilder = z.infer<typeof ClanImageBuilderSchema>;
export type TopImageBuilder = z.infer<typeof TopImageBuilderSchema>;
export type ShopMap = z.infer<typeof ShopsEnum>;
export type ShopImageBuilder = z.infer<typeof ShopImageBuilderSchema>;
export type CasinoImageBuilder = z.infer<typeof CasinoImageBuilderSchema>;
export type CoupleImageBuilder = z.infer<typeof CoupleImageBuilderSchema>;
export type CasinoVariant = z.infer<typeof CasinoVariantsEnum>;
export type CasinoType = z.infer<typeof CasinoTypesEnum>;
export type GambleType = z.infer<typeof GambleTypesEnum>;
export type TopEntity = z.infer<typeof TopEntitySchema>;
export type TopMap = z.infer<typeof TopsEnum>;
export type ShopElement = z.infer<typeof ShopElementSchema>;
