import { KarboAI } from 'karboai';
import { config } from 'dotenv';

import routes from './modules/index';

config({ path: '.env', quiet: true });

(async () => {
  if (!process.env.BOT_TOKEN || !process.env.BOT_ID) {
    throw new Error('BOT_TOKEN and BOT_ID must be set in the environment');
  }

  const karbo = new KarboAI({
    token: process.env.BOT_TOKEN,
    id: process.env.BOT_ID,
    enableLogging: true,
  });

  karbo.bind(...routes);

  karbo.attach();
})();
