import { Router } from 'karboai';

import { bank, bet, buy, daily, jobs, shop, trade, transfer, work } from './service';

const router = new Router('economy');

router.command('/bank', bank);
router.command('/daily', daily);
router.command('/trf', transfer);
router.command('/trade', trade);
router.command('/bet', bet);
router.command('/jobs', jobs);
router.command('/work', work);
router.command('/shop', shop);
router.command('/buy', buy);

export default router;
