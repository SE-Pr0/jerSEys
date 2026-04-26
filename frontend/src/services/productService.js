import footballKits from '../data/mrfootball-men-kits.json';
import basketballJerseys from '../data/projersey-nba-men-jerseys.json';
import { apiRequest } from './api';

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
const sizeSortOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

const normalizeSize = (size) => {
  const normalizedSizes = {
    Small: 'S',
    Medium: 'M',
    Large: 'L',
  };

  return normalizedSizes[size] || size;
};

const slugify = (value) =>
  String(value || '')
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

const sortSizes = (sizes) =>
  [...new Set((sizes || []).map(normalizeSize).filter(Boolean))].sort((left, right) => {
    const leftIndex = sizeSortOrder.indexOf(left);
    const rightIndex = sizeSortOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

const rawCatalog = [...footballKits, ...basketballJerseys];

const fallbackCatalog = rawCatalog.map((kit, index) => {
  const category = isNationalTeam(kit) ? 'national' : 'club';
  const sizes = sortSizes(kit.sizes);

  return {
    id: `${slugify(kit.team)}-${slugify(kit.name)}-${index}`,
    backendId: null,
    name: kit.name,
    team: kit.team,
    sport: kit.sport,
    sportLabel: kit.sport === 'football' ? 'Football' : 'Basketball',
    category,
    categoryLabel: category === 'national' ? 'National Team' : 'Club Team',
    image: kit.image,
    description: kit.description,
    sizes,
    price: Number(kit.price) || 0,
    season: extractSeason(kit),
    sourceUrl: kit.sourceUrl,
    badge: buildBadge(kit, index),
    inStock: sizes.length > 0,
    stock: sizes.length > 0 ? sizes.length : 0,
    images: [],
  };
});

let productCache = [...fallbackCatalog];

const withSearchText = (product) => ({
  ...product,
  searchText: [
    product.name,
    product.team,
    product.description,
    product.category,
    product.sport,
    product.sizes.join(' '),
  ]
    .join(' ')
    .toLowerCase(),
});

const mapBackendProduct = (product, index = 0) => {
  const sport = (product?.sport || '').toLowerCase() === 'basketball' ? 'basketball' : 'football';
  const category = (product?.category || '').toLowerCase() || 'club';
  const sizes = sortSizes(
    typeof product?.size === 'string'
      ? product.size.split(/[,\s/]+/)
      : Array.isArray(product?.sizes)
        ? product.sizes
        : [],
  );
  const image = product?.image_url || product?.images?.find((item) => item?.is_primary)?.image_url || product?.images?.[0]?.image_url || '';
  const stock = Number(product?.stock) || 0;

  return withSearchText({
    id: String(product.id),
    backendId: Number(product.id),
    name: product.name || 'Jersey',
    team: product.team || 'Club',
    sport,
    sportLabel: sport === 'football' ? 'Football' : 'Basketball',
    category,
    categoryLabel: category === 'national' ? 'National Team' : 'Club Team',
    image,
    description: product.description || '',
    sizes,
    price: Number(product.price) || 0,
    season: extractSeason({
      name: product.name || '',
      description: product.description || '',
    }),
    sourceUrl: product.sourceUrl || '',
    badge: stock > 0 ? buildBadge(product, index) : undefined,
    inStock: stock > 0,
    stock,
    images: Array.isArray(product?.images) ? product.images : [],
  });
};

const updateCache = (products) => {
  if (Array.isArray(products) && products.length > 0) {
    productCache = products.map((product, index) => mapBackendProduct(product, index));
    return productCache;
  }

  return productCache;
};

export const fetchProducts = async (filters = {}) => {
  const payload = await apiRequest('/products', { query: filters });
  return updateCache(Array.isArray(payload?.data) ? payload.data : []);
};

export const fetchProductById = async (productId) => {
  const payload = await apiRequest(`/products/${productId}`);
  const mappedProduct = mapBackendProduct(payload?.data || {}, 0);
  const cacheWithoutProduct = productCache.filter((product) => product.id !== mappedProduct.id);
  productCache = [mappedProduct, ...cacheWithoutProduct];
  return mappedProduct;
};

export const getAllProducts = fetchProducts;
export const getProductById = fetchProductById;
export const searchProducts = async (query) => fetchProducts(query ? { search: query } : {});

export const getShopProducts = () => productCache;

export const getShopProductById = (productId) =>
  productCache.find((product) => String(product.id) === String(productId))
  || fallbackCatalog.find((product) => String(product.id) === String(productId));

export const getRelatedShopProducts = (productId, limit = 4) => {
  const selectedProduct = getShopProductById(productId);
  const sourceCatalog = productCache.length > 0 ? productCache : fallbackCatalog;

  if (!selectedProduct) {
    return sourceCatalog.slice(0, limit);
  }

  return sourceCatalog
    .filter((product) => product.id !== selectedProduct.id)
    .sort((left, right) => {
      const leftScore =
        Number(left.sport === selectedProduct.sport)
        + Number(left.category === selectedProduct.category)
        + Number(left.team === selectedProduct.team);
      const rightScore =
        Number(right.sport === selectedProduct.sport)
        + Number(right.category === selectedProduct.category)
        + Number(right.team === selectedProduct.team);

      return rightScore - leftScore;
    })
    .slice(0, limit);
};

export const getShopSummary = () => {
  const sourceCatalog = productCache.length > 0 ? productCache : fallbackCatalog;
  const uniqueClubTeams = new Set(
    sourceCatalog.filter((product) => product.category === 'club').map((product) => product.team),
  );
  const uniqueCountries = new Set(
    sourceCatalog.filter((product) => product.category === 'national').map((product) => product.team),
  );

  return {
    totalProducts: sourceCatalog.length,
    clubCount: uniqueClubTeams.size,
    countryCount: uniqueCountries.size,
    inStockCount: sourceCatalog.filter((product) => product.inStock).length,
    outOfStockCount: sourceCatalog.filter((product) => !product.inStock).length,
  };
};
