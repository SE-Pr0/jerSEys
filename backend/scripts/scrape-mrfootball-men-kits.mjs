import { main } from '../scraper/scripts/scrape-mrfootball-men-kits.mjs';

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
