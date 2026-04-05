import { Router } from 'karboai';
import { meCallback } from './service';

const router = new Router('profile');

router.command('/me', meCallback);

export default router;
