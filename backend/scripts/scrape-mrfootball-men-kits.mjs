import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://mrfootball-lb.com';
const COLLECTION_HANDLE = 'new-releases';
const LIMIT = 250;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'src', 'data', 'mrfootball-men-kits.json');

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

  const sizes = [...new Set(
    (product.variants || [])
      .map((variant) => variant.option1 || variant.title)
      .filter((size) => size && size !== 'Default Title')
  )];

  const sizeText = sizes.length ? ` Available sizes: ${sizes.join(', ')}.` : '';
  return `${product.title} men's football kit from Mr Football.${sizeText}`.trim();
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
  const sizes = [...new Set(
    (product.variants || [])
      .map((variant) => variant.option1 || variant.title)
      .filter((size) => size && size !== 'Default Title')
  )];

  const priceVariant = (product.variants || []).find((variant) => variant.price) || product.variants?.[0];
  const imageSource = product.image?.src || product.images?.[0]?.src || '';

  return {
    name: product.title,
    team: inferTeam(product.title),
    sport: 'football',
    price: priceVariant ? Number(priceVariant.price) : null,
    image: normalizeUrl(imageSource),
    description: buildDescription(product),
    sizes,
    sourceUrl: `${BASE_URL}/products/${product.handle}`,
  };
}

async function main() {
  const products = await fetchAllProducts();
  const mapped = products.map(mapProduct);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(mapped, null, 2)}\n`, 'utf8');

  console.log(`Saved ${mapped.length} products to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
