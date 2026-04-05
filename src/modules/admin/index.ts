import { Router } from 'karboai';

import { adminMiddleware } from '../../middlewares/admin';
import { pingCallback } from './service';

const router = new Router('admin');

router.pre(adminMiddleware);

router.command('/ping', pingCallback);

export default router;
