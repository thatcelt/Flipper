import { Router } from 'karboai';

import { heroMiddleware, pat, rescue, sacrifice } from './service';

const router = new Router('hero');

router.use('message', heroMiddleware);

router.command('/sacrifice', sacrifice);
router.command('/rescue', rescue);
router.command('/pat', pat);

export default router;
