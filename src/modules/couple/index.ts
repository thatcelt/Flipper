import { Router } from 'karboai';

import {
  kiss,
  love,
  loveBackground,
  loveFrame,
  marry,
  marryNo,
  marryYes,
  coupleMiddleware,
  offerMiddleware,
  divorce,
} from './service';

const router = new Router('couple');

const middlewares = [coupleMiddleware];

router.command('/marry', marry);
router.command('/love', { middlewares }, love);
router.command('/kiss', { middlewares }, kiss);
router.command('/lv-bg', { middlewares }, loveBackground);
router.command('/lv-fr', { middlewares }, loveFrame);
router.command('/divorce', { middlewares }, divorce);

router.button('marry-yes', { regex: /marry-yes_.*/, middlewares: [offerMiddleware] }, marryYes);
router.button('marry-no', { regex: /marry-no_.*/, middlewares: [offerMiddleware] }, marryNo);

export default router;
