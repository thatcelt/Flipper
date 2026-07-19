import { Router } from 'karboai';

import {
  _clan,
  _delete,
  accept,
  create,
  decline,
  edit,
  invite,
  inviteMiddleware,
  leave,
  setBackground,
  setFrame,
} from './service';

const router = new Router('clans');

router.command('/create-clan', create);
router.command('/clan', _clan);
router.command('/edit-clan', edit);
router.command('/cl-fr', setFrame);
router.command('/cl-bg', setBackground);
router.command('/invite', invite);
router.command('/delete-clan', _delete);
router.command('/leave', leave);

router.button(
  'accept-invite',
  { regex: /accept-invite_.*/, middlewares: [inviteMiddleware] },
  accept
);
router.button(
  'decline-invite',
  { regex: /decline-invite_.*/, middlewares: [inviteMiddleware] },
  decline
);

export default router;
