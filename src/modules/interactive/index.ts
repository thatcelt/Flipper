import { Router } from 'karboai';
import {
  decreaseReputationCallback,
  duelCallback,
  increaseReputationCallback,
  robCallback,
} from './service';

const router = new Router('interactive');

router.command('+rep', increaseReputationCallback);
router.command('-rep', decreaseReputationCallback);
router.command('/rob', robCallback);
router.command('/duel', duelCallback);

export default router;
