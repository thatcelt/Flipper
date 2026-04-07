import { Router } from 'karboai';

import {
  helpCallback,
  joinCallback,
  leaveCallback,
  onMessageCallback,
} from './service';

const router = new Router('startup');

router.on('join', joinCallback);
router.on('leave', leaveCallback);
router.on('message', onMessageCallback);

router.command('/help', helpCallback);

export default router;
