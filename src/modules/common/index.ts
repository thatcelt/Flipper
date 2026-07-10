import { Router } from 'karboai';

import { help, message, onJoin } from './service';

const router = new Router('common');

router.on('join', onJoin);
router.on('message', message);
router.command('/help', help);

export default router;
