import { Router } from 'karboai';

import { adminMiddleware } from '../../middlewares/admin';
import { addCallback, pingCallback } from './service';

const router = new Router('admin');

router.pre(adminMiddleware);

router.command('/ping', pingCallback);
router.command('/add', addCallback);

export default router;
