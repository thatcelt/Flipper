import { Router } from 'karboai';

import { crime, hack, kick, villainMiddleware } from './service';

const router = new Router('villain');

router.use('message', villainMiddleware);

router.command('/hack', hack);
router.command('/crime', crime);
router.command('/kick', kick);

export default router;
