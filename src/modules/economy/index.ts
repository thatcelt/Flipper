import { Router } from 'karboai';
import {
  betCallback,
  dailyCallback,
  flipCallback,
  shopCallback,
  tradeCallback,
  transferCallback,
  workCallback,
  worksListCallback,
} from './service';

const router = new Router('economy');

router.command('/wlist', worksListCallback);
router.command('/daily', dailyCallback);
router.command('/work', workCallback);
router.command('/bet', betCallback);
router.command('/trf', transferCallback);
router.command('/trade', tradeCallback);
router.command('/flip', flipCallback);
router.command('/shop', shopCallback);

export default router;
