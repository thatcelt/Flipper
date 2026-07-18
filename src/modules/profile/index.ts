import { Router } from 'karboai';

import { items, me, setBackground, setCardColor, setFrame } from './service';

const router = new Router('profile');

router.command('/me', me);
router.command('/items', items);
router.command('/fr', setFrame);
router.command('/bg', setBackground);
router.command('/card', setCardColor);

export default router;
