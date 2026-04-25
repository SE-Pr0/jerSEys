import { closePool, insertProduct } from './db.mjs';

const BASE_URL = 'https://mrfootball-lb.com';
const COLLECTION_HANDLE = 'new-releases';
const LIMIT = 250;

const STOP_WORDS = new Set([
  'home',
  'away',
  'third',
  'fourth',
  'goalkeeper',
  'jersey',
  'kit',
  'long',
  'sleeve',
  'player',
  'version',
  'limited',
  'edition',
  'retro',
  'special',
  'pre',
  'match',
]);

function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
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

function inferTeam(name = '') {
  const seasonMatch = name.match(/\b(?:\d{2}\/\d{2}|\d{4})\b/);
  let candidate = seasonMatch ? name.slice(0, seasonMatch.index).trim() : name;

  candidate = candidate
    .replace(/\b(Men'?s|Women'?s|Kids|Baby)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = candidate.split(' ').filter(Boolean);
  const cleaned = [];

  for (const word of words) {
    const normalized = word.toLowerCase();

    if (STOP_WORDS.has(normalized)) {
      break;
    }

    cleaned.push(word);
  }

  return cleaned.join(' ').trim() || candidate || name;
}

function buildDescription(product) {
  const htmlDescription = stripHtml(product.body_html);

  if (htmlDescription) {
    return htmlDescription;
  }

  return `${product.title} men's football kit from Mr Football.`;
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
  const products = [];
  let page = 1;

  while (true) {
    const batch = await fetchCollectionPage(page);

    if (!batch.length) {
      break;
    }

    products.push(...batch);

    if (batch.length < LIMIT) {
      break;
    }

    page += 1;
  }

  return products;
}

function mapProduct(product) {
  const priceVariant = (product.variants || []).find((variant) => variant.price) || product.variants?.[0];
  const imageSource = product.image?.src || product.images?.[0]?.src || '';

  return {
    name: product.title ?? '',
    description: buildDescription(product),
    price: priceVariant ? Number(priceVariant.price) : null,
    stock: 10,
    category: 'Football',
    team: inferTeam(product.title ?? ''),
    sport: 'Football',
    size: null,
    image_url: normalizeUrl(imageSource),
  };
}

export async function main() {
  let insertedCount = 0;

  try {
    const products = await fetchAllProducts();

    for (const product of products) {
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
