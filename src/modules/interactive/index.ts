import { Router } from 'karboai';
import {
  decreaseReputationCallback,
  increaseReputationCallback,
} from './service';

const router = new Router('interactive');

router.command('+rep', increaseReputationCallback);
router.command('-rep', decreaseReputationCallback);

export default router;
