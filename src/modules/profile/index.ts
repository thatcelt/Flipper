import { Router } from 'karboai';

import { me } from './service';

const router = new Router('profile');

router.command('/me', me);

export default router;
