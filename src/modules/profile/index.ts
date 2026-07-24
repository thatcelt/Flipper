import { Router } from 'karboai';

import {
  items,
  me,
  perk,
  setPerk,
  perksMiddleware,
  setBackground,
  setCardColor,
  setFrame,
} from './service';

const router = new Router('profile');

router.command('/me', me);
router.command('/items', items);
router.command('/fr', setFrame);
router.command('/bg', setBackground);
router.command('/card', setCardColor);
router.command('/perk', perk);

router.button('set-perk', { regex: /set-perk_.*/, middlewares: [perksMiddleware] }, setPerk);

export default router;
