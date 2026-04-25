import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const envPath = path.join(backendRoot, '.env');

let pool;

function parseEnvFile(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    env[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return env;
}

async function loadDbConfig() {
  const envFile = await fs.readFile(envPath, 'utf8');
  const env = parseEnvFile(envFile);

  return {
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'jerseys_db',
  };
}

async function getPool() {
  if (!pool) {
    const config = await loadDbConfig();

    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}

function cleanText(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function cleanPrice(value) {
  const normalizedValue =
    typeof value === 'string'
      ? value.replace(/[^0-9.-]/g, '')
      : value;

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeProduct(product) {
  const sanitized = {
    name: cleanText(product.name),
    description: cleanText(product.description),
    price: cleanPrice(product.price),
    stock: Number.isInteger(product.stock) && product.stock >= 0 ? product.stock : 10,
    category: cleanText(product.category),
    team: cleanText(product.team),
    sport: cleanText(product.sport),
    size: cleanText(product.size),
    image_url: cleanText(product.image_url),
  };

  if (!sanitized.name || sanitized.price === null || !sanitized.category || !sanitized.sport) {
    return null;
  }

  return sanitized;
}

export async function insertProduct(product) {
  const sanitizedProduct = sanitizeProduct(product);

  if (!sanitizedProduct) {
    return false;
  }

  const db = await getPool();
  const [existingProducts] = await db.execute(
    'SELECT id FROM products WHERE name = ? LIMIT 1',
    [sanitizedProduct.name]
  );

  if (existingProducts.length > 0) {
    return false;
  }

  await db.execute(
    `INSERT INTO products
      (name, description, price, stock, category, team, sport, size, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sanitizedProduct.name,
      sanitizedProduct.description,
      sanitizedProduct.price,
      sanitizedProduct.stock,
      sanitizedProduct.category,
      sanitizedProduct.team,
      sanitizedProduct.sport,
      sanitizedProduct.size,
      sanitizedProduct.image_url,
    ]
  );

  return true;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
