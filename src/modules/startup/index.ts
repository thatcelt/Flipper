import { Router } from 'karboai';

import { helpCallback, joinCallback } from './service';

const router = new Router('startup');

router.on('join', joinCallback);

router.command('/help', helpCallback);

export default router;
