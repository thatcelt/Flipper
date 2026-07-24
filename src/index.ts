import { KarboAI } from 'karboai';

import { loadImages } from './util/canvas';
import { common, profile, economy, actions, couple, clans, hero, villain } from './modules';

const karbo = new KarboAI({
  token: process.env.BOT_TOKEN,
  id: process.env.BOT_ID,
  enableLogging: true,
});

(async () => {
  await loadImages();

  karbo.bind(common, profile, economy, actions, couple, clans, hero, villain);

  karbo.attach();
})();
