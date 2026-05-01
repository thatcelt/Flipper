import { Router } from 'karboai';
import {
  decreaseReputationCallback,
  duelCallback,
  increaseReputationCallback,
  kissCallback,
  marryCallback,
  noCallback,
  robCallback,
  topCallback,
  yesCallback,
} from './service';

const router = new Router('interactive');

router.command('+rep', increaseReputationCallback);
router.command('-rep', decreaseReputationCallback);
router.command('/rob', robCallback);
router.command('/duel', duelCallback);
router.command('/top', topCallback);
router.command('/marry', marryCallback);
router.command('да', yesCallback);
router.command('нет', noCallback);
router.command('/kiss', kissCallback);

export default router;
