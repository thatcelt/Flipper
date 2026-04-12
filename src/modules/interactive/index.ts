import { Router } from 'karboai';
import {
  decreaseReputationCallback,
  duelCallback,
  increaseReputationCallback,
  robCallback,
  topCallback,
} from './service';

const router = new Router('interactive');

router.command('+rep', increaseReputationCallback);
router.command('-rep', decreaseReputationCallback);
router.command('/rob', robCallback);
router.command('/duel', duelCallback);
router.command('/top', topCallback);

export default router;
