import { Router } from 'karboai';

import { bankCallback, meCallback } from './service';

const router = new Router('profile');

router.command('/me', meCallback);
router.command('/bank', bankCallback);

export default router;
