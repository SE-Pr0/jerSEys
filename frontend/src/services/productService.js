import footballKits from '../data/mrfootball-men-kits.json';
import basketballJerseys from '../data/projersey-nba-men-jerseys.json';

const PRODUCTS_API_URL = 'http://localhost:5000/api/products';

const NATIONAL_TEAM_NAMES = new Set([
  'argentina',
  'australia',
  'belgium',
  'brazil',
  'colombia',
  'costa rica',
  'croatia',
  'england',
  'france',
  'germany',
  'italy',
  'japan',
  'korea',
  'mexico',
  'morocco',
  'netherlands',
  'norway',
  'poland',
  'portugal',
  'saudi arabia',
  'scotland',
  'spain',
  'sweden',
  'turkey',
  'uruguay',
  'usa',
]);

const SPECIAL_DROP_PATTERN = /goalkeeper|limited|special|night edition|long sleeve|reissue|slam jam|bape|dragon|anime|legends/i;
const YEAR_PATTERN = /\b(19|20)\d{2}(?:\/\d{2,4})?\b/;

const normalizeSize = (size) => {
  const normalizedSizes = {
    Small: 'S',
    Medium: 'M',
    Large: 'L',
  };

  return normalizedSizes[size] || size;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isNationalTeam = (kit) => {
  const teamName = (kit.team || '').toLowerCase().trim();
  const description = `${kit.name} ${kit.description}`.toLowerCase();

  return NATIONAL_TEAM_NAMES.has(teamName) || /national|world cup|euro|copa america/i.test(description);
};

const extractSeason = (kit) => {
  const match = `${kit.name} ${kit.description}`.match(YEAR_PATTERN);
  return match ? match[0] : 'Latest drop';
};

const buildBadge = (kit, index) => {
  if (index < 8) {
    return 'new';
  }

  if (SPECIAL_DROP_PATTERN.test(kit.name)) {
    return 'hot';
  }

  return undefined;
};

const dedupeSizes = (sizes) => [...new Set((sizes || []).map(normalizeSize))];

const rawCatalog = [...footballKits, ...basketballJerseys];

const catalog = rawCatalog.map((kit, index) => {
  const category = isNationalTeam(kit) ? 'national' : 'club';
  const sizes = dedupeSizes(kit.sizes);

  return {
    id: `${slugify(kit.team)}-${slugify(kit.name)}-${index}`,
    name: kit.name,
    team: kit.team,
    sport: kit.sport,
    sportLabel: kit.sport === 'football' ? 'Football' : 'Basketball',
    category,
    categoryLabel: category === 'national' ? 'National Team' : 'Club Team',
    image: kit.image,
    description: kit.description,
    sizes,
    price: kit.price,
    season: extractSeason(kit),
    sourceUrl: kit.sourceUrl,
    badge: buildBadge(kit, index),
    inStock: sizes.length > 0,
    searchText: `${kit.name} ${kit.team} ${kit.description} ${category} ${sizes.join(' ')}`.toLowerCase(),
  };
});

const uniqueClubTeams = new Set(catalog.filter((product) => product.category === 'club').map((product) => product.team));
const uniqueCountries = new Set(catalog.filter((product) => product.category === 'national').map((product) => product.team));

const handleProductApiResponse = async (response, fallbackMessage) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload?.data;
};

export const getAllProducts = async () => {
  try {
    const response = await fetch(PRODUCTS_API_URL);
    return await handleProductApiResponse(response, 'Failed to fetch products');
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/${encodeURIComponent(id)}`);
    return await handleProductApiResponse(response, 'Failed to fetch product');
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch product');
  }
};

export const searchProducts = async (query) => {
  try {
    const searchTerm = typeof query === 'string' ? query.trim() : '';
    const url = searchTerm
      ? `${PRODUCTS_API_URL}?search=${encodeURIComponent(searchTerm)}`
      : PRODUCTS_API_URL;
    const response = await fetch(url);

    return await handleProductApiResponse(response, 'Failed to search products');
  } catch (error) {
    throw new Error(error.message || 'Failed to search products');
  }
};

export const getShopProducts = () => catalog;

export const getShopProductById = (productId) => catalog.find((product) => product.id === productId);

export const getRelatedShopProducts = (productId, limit = 4) => {
  const selectedProduct = getShopProductById(productId);

  if (!selectedProduct) {
    return catalog.slice(0, limit);
  }

  return catalog
    .filter((product) => product.id !== productId)
    .sort((left, right) => {
      const leftScore =
        Number(left.sport === selectedProduct.sport) +
        Number(left.category === selectedProduct.category) +
        Number(left.team === selectedProduct.team);
      const rightScore =
        Number(right.sport === selectedProduct.sport) +
        Number(right.category === selectedProduct.category) +
        Number(right.team === selectedProduct.team);

      return rightScore - leftScore;
    })
    .slice(0, limit);
};

export const getShopSummary = () => ({
  totalProducts: catalog.length,
  clubCount: uniqueClubTeams.size,
  countryCount: uniqueCountries.size,
  inStockCount: catalog.filter((product) => product.inStock).length,
  outOfStockCount: catalog.filter((product) => !product.inStock).length,
});
