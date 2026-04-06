import { Router } from 'karboai';
import { dailyCallback, workCallback, worksListCallback } from './service';

const router = new Router('economy');

router.command('/wlist', worksListCallback);
router.command('/daily', dailyCallback);
router.command('/work', workCallback);

export default router;
