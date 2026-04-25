import { closePool, insertProduct } from './db.mjs';

const BASE_URL = 'https://projerseysports.com';
const COLLECTION_HANDLE = 'nba';
const LIMIT = 250;

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
    if ((product.title || '').includes(team)) {
      return team;
    }
  }

  return 'Unknown';
}

function buildDescription(product) {
  const description = stripHtml(product.body_html);

  if (description) {
    return description;
  }

  const team = inferTeam(product);
  return `${product.title} men's basketball jersey from ${team}.`;
}

function normalizeUrl(url = '') {
  if (!url) {
    return '';
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }

  return url;
}

function mapProduct(product) {
  const primaryVariant = (product.variants || []).find((variant) => variant.price) || product.variants?.[0];
  const imageSource = product.images?.[0]?.src || '';

  return {
    name: product.title ?? '',
    description: buildDescription(product),
    price: primaryVariant ? Number(primaryVariant.price) : null,
    stock: 10,
    category: 'Basketball',
    team: inferTeam(product),
    sport: 'Basketball',
    size: null,
    image_url: normalizeUrl(imageSource),
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

export async function main() {
  let insertedCount = 0;

  try {
    const allProducts = await fetchAllProducts();

    for (const product of allProducts.filter(isMensBasketballJersey)) {
      const inserted = await insertProduct(mapProduct(product));

      if (inserted) {
        insertedCount += 1;
      }
    }

    console.log(`Inserted ${insertedCount} new products`);
  } finally {
    await closePool();
  }
}

const isDirectRun = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
