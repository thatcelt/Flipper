import { Router } from 'karboai';
import {
  decreaseReputation,
  duel,
  increaseReputation,
  rob,
  _top,
  punch,
  dodge,
  buffIce,
  deck,
  accept,
  escape,
  requestMiddleware,
  duelMiddleware,
} from './service';

const router = new Router('actions');

router.command('/rob', rob);
router.command('+rep', increaseReputation);
router.command('-rep', decreaseReputation);
router.command('/top', _top);

router.command('/duel', duel);
router.button('accept', { regex: /accept_.*/, middlewares: [requestMiddleware] }, accept);
router.button('escape', { regex: /escape_.*/, middlewares: [requestMiddleware] }, escape);
router.button('duel-punch', { regex: /punch_.*/, middlewares: [duelMiddleware] }, punch);
router.button('duel-dodge', { regex: /dodge_.*/, middlewares: [duelMiddleware] }, dodge);
router.button('duel-ice', { regex: /buff-ice_.*/, middlewares: [duelMiddleware] }, buffIce);
router.button('duel-deck', { regex: /deck_.*/, middlewares: [duelMiddleware] }, deck);

export default router;
