import footballKits from '../data/mrfootball-men-kits.json';
import basketballJerseys from '../data/projersey-nba-men-jerseys.json';

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

export const getShopProducts = () => catalog;

export const getShopSummary = () => ({
  totalProducts: catalog.length,
  clubCount: uniqueClubTeams.size,
  countryCount: uniqueCountries.size,
  inStockCount: catalog.filter((product) => product.inStock).length,
  outOfStockCount: catalog.filter((product) => !product.inStock).length,
});
