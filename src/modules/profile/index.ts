import { Router } from 'karboai';

import {
  backgroundCallback,
  bankCallback,
  frameCallback,
  loveCallback,
  meCallback,
  ownedCallback,
} from './service';

const router = new Router('profile');

router.command('/me', meCallback);
router.command('/bank', bankCallback);
router.command('/fr', frameCallback);
router.command('/bg', backgroundCallback);
router.command('/owned', ownedCallback);
router.command('/love', loveCallback);

export default router;
