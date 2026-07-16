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
} from './service';

const router = new Router('actions');

router.command('/rob', rob);
router.command('+rep', increaseReputation);
router.command('-rep', decreaseReputation);
router.command('/top', _top);

router.command('/duel', duel);
router.button('accept', { regex: /accept_.*/ }, accept);
router.button('escape', { regex: /escape_.*/ }, escape);
router.button('duel-punch', { regex: /punch_.*/ }, punch);
router.button('duel-dodge', { regex: /dodge_.*/ }, dodge);
router.button('duel-ice', { regex: /buff-ice_.*/ }, buffIce);
router.button('duel-deck', { regex: /deck_.*/ }, deck);

export default router;
