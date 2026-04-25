USE jerseys_db;

SET @team_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'team'
);
SET @team_sql := IF(
  @team_exists = 0,
  'ALTER TABLE products ADD COLUMN team VARCHAR(100) NULL AFTER category',
  'SELECT 1'
);
PREPARE team_stmt FROM @team_sql;
EXECUTE team_stmt;
DEALLOCATE PREPARE team_stmt;

SET @sport_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'sport'
);
SET @sport_sql := IF(
  @sport_exists = 0,
  'ALTER TABLE products ADD COLUMN sport VARCHAR(100) NULL AFTER team',
  'SELECT 1'
);
PREPARE sport_stmt FROM @sport_sql;
EXECUTE sport_stmt;
DEALLOCATE PREPARE sport_stmt;

SET @size_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'size'
);
SET @size_sql := IF(
  @size_exists = 0,
  'ALTER TABLE products ADD COLUMN size VARCHAR(50) NULL AFTER sport',
  'SELECT 1'
);
PREPARE size_stmt FROM @size_sql;
EXECUTE size_stmt;
DEALLOCATE PREPARE size_stmt;

SET @image_url_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image_url'
);
SET @image_url_sql := IF(
  @image_url_exists = 0,
  'ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL AFTER size',
  'SELECT 1'
);
PREPARE image_url_stmt FROM @image_url_sql;
EXECUTE image_url_stmt;
DEALLOCATE PREPARE image_url_stmt;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_images_product_id (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE products 
SET sport = category 
WHERE sport IS NULL AND id > 0;
