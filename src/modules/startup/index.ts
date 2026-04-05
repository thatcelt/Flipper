import { Router } from 'karboai';

import { helpCallback, joinCallback, onMessageCallback } from './service';

const router = new Router('startup');

router.on('join', joinCallback);

router.on('message', onMessageCallback);

router.command('/help', helpCallback);

export default router;
