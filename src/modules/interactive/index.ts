import { Router } from 'karboai';
import {
  decreaseReputationCallback,
  increaseReputationCallback,
  robCallback,
} from './service';

const router = new Router('interactive');

router.command('+rep', increaseReputationCallback);
router.command('-rep', decreaseReputationCallback);
router.command('/rob', robCallback);

export default router;
