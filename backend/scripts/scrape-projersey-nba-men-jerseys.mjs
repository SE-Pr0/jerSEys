import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://projerseysports.com';
const COLLECTION_HANDLE = 'nba';
const LIMIT = 250;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'src', 'data', 'projersey-nba-men-jerseys.json');

const NBA_TEAMS = new Map([
  ['atlanta-hawks', 'Atlanta Hawks'],
  ['boston-celtics', 'Boston Celtics'],
  ['brooklyn-nets', 'Brooklyn Nets'],
  ['charlotte-hornets', 'Charlotte Hornets'],
  ['chicago-bulls', 'Chicago Bulls'],
  ['cleveland-cavaliers', 'Cleveland Cavaliers'],
  ['dallas-mavericks', 'Dallas Mavericks'],
  ['denver-nuggets', 'Denver Nuggets'],
  ['detroit-pistons', 'Detroit Pistons'],
  ['golden-state-warriors', 'Golden State Warriors'],
  ['houston-rockets', 'Houston Rockets'],
  ['indiana-pacers', 'Indiana Pacers'],
  ['los-angeles-clippers', 'Los Angeles Clippers'],
  ['los-angeles-lakers', 'Los Angeles Lakers'],
  ['memphis-grizzlies', 'Memphis Grizzlies'],
  ['miami-heat', 'Miami Heat'],
  ['milwaukee-bucks', 'Milwaukee Bucks'],
  ['minnesota-timberwolves', 'Minnesota Timberwolves'],
  ['new-orleans-pelicans', 'New Orleans Pelicans'],
  ['new-york-knicks', 'New York Knicks'],
  ['oklahoma-city-thunder', 'Oklahoma City Thunder'],
  ['orlando-magic', 'Orlando Magic'],
  ['philadelphia-76ers', 'Philadelphia 76ers'],
  ['phoenix-suns', 'Phoenix Suns'],
  ['portland-trail-blazers', 'Portland Trail Blazers'],
  ['sacramento-kings', 'Sacramento Kings'],
  ['san-antonio-spurs', 'San Antonio Spurs'],
  ['seattle-supersonics', 'Seattle Supersonics'],
  ['toronto-raptors', 'Toronto Raptors'],
  ['utah-jazz', 'Utah Jazz'],
  ['washington-wizards', 'Washington Wizards'],
]);

function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|ul|ol)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferTeam(product) {
  for (const tag of product.tags || []) {
    if (NBA_TEAMS.has(tag)) {
      return NBA_TEAMS.get(tag);
    }
  }

  for (const team of NBA_TEAMS.values()) {
    if (product.title.includes(team)) {
      return team;
    }
  }

  return 'Unknown';
}

function collectSizes(product) {
  return [...new Set(
    (product.variants || [])
      .map((variant) => variant.option1 || variant.title)
      .filter((value) => value && value !== 'Default Title')
  )];
}

function buildDescription(product) {
  const description = stripHtml(product.body_html);
  if (description) {
    return description;
  }

  const team = inferTeam(product);
  return `${product.title} men's basketball jersey from ${team}.`;
}

function mapProduct(product) {
  const primaryVariant = (product.variants || []).find((variant) => variant.price) || product.variants?.[0];
  const images = (product.images || []).map((image) => image.src).filter(Boolean);

  return {
    name: product.title,
    team: inferTeam(product),
    sport: 'basketball',
    price: primaryVariant ? Number(primaryVariant.price) : null,
    image: images[0] || '',
    description: buildDescription(product),
    sizes: collectSizes(product),
    sourceUrl: `${BASE_URL}/products/${product.handle}`,
  };
}

function isMensBasketballJersey(product) {
  const tags = new Set(product.tags || []);

  return (
    product.product_type === 'Jerseys' &&
    tags.has('mens') &&
    tags.has('nba') &&
    tags.has('jerseys')
  );
}

async function fetchCollectionPage(page) {
  const url = `${BASE_URL}/collections/${COLLECTION_HANDLE}/products.json?limit=${LIMIT}&page=${page}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection page ${page}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.products || [];
}

async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;

  while (true) {
    const batch = await fetchCollectionPage(page);

    if (!batch.length) {
      break;
    }

    allProducts.push(...batch);

    if (batch.length < LIMIT) {
      break;
    }

    page += 1;
  }

  return allProducts;
}

async function main() {
  const allProducts = await fetchAllProducts();
  const jerseys = allProducts.filter(isMensBasketballJersey).map(mapProduct);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(jerseys, null, 2)}\n`, 'utf8');

  console.log(`Saved ${jerseys.length} men's NBA jerseys to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
