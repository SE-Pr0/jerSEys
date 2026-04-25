import { main } from '../scraper/scripts/scrape-projersey-nba-men-jerseys.mjs';

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
