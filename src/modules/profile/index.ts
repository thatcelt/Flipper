import { Router } from 'karboai';

import { items, me, setBackground, setFrame } from './service';

const router = new Router('profile');

router.command('/me', me);
router.command('/items', items);
router.command('/fr', setFrame);
router.command('/bg', setBackground);

export default router;
