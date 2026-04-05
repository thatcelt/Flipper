import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { z } from 'zod';
import { COLORS } from '../constants';

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
]);

export const FontsEnum = z.enum(['medium', 'regular', 'italic']);

export const AlignEnum = z.enum(['left', 'center', 'right', 'end', 'start']);

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
    .enum(Object.keys(COLORS) as [keyof typeof COLORS, ...string[]])
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

export type ImagesMap = z.infer<typeof ImagesEnum>;
export type FontsMap = z.infer<typeof FontsEnum>;
export type DrawRoundedImageConfig = z.infer<
  typeof DrawRoundedImageConfigSchema
>;
export type DrawTextConfig = z.infer<typeof DrawTextConfigSchema>;
export type DotsMap = z.infer<typeof DotsMapSchema>;
export type DrawImageArrayConfig = z.infer<typeof DrawImageArrayConfigSchema>;
export type CanvasContext = z.infer<typeof CanvasContextSchema>;
export type ProfileImageBuilder = z.infer<typeof ProfileImageBuilderSchema>;
