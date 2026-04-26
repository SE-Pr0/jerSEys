USE jerseys_db;

CREATE TABLE IF NOT EXISTS custom_jerseys (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  base_product_id INT UNSIGNED NULL,
  design_data JSON NOT NULL,
  price DECIMAL(10, 2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_custom_jerseys_user_id (user_id),
  INDEX idx_custom_jerseys_base_product_id (base_product_id),
  CONSTRAINT fk_custom_jerseys_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_custom_jerseys_base_product
    FOREIGN KEY (base_product_id) REFERENCES products(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @name_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'custom_jerseys'
    AND COLUMN_NAME = 'name'
);
SET @name_sql := IF(
  @name_exists = 0,
  'ALTER TABLE custom_jerseys ADD COLUMN name VARCHAR(150) NOT NULL DEFAULT ''My Custom Jersey'' AFTER user_id',
  'SELECT 1'
);
PREPARE name_stmt FROM @name_sql;
EXECUTE name_stmt;
DEALLOCATE PREPARE name_stmt;

SET @base_product_id_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'custom_jerseys'
    AND COLUMN_NAME = 'base_product_id'
);
SET @base_product_id_sql := IF(
  @base_product_id_exists = 0,
  'ALTER TABLE custom_jerseys ADD COLUMN base_product_id INT UNSIGNED NULL AFTER name',
  'SELECT 1'
);
PREPARE base_product_id_stmt FROM @base_product_id_sql;
EXECUTE base_product_id_stmt;
DEALLOCATE PREPARE base_product_id_stmt;

SET @price_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'custom_jerseys'
    AND COLUMN_NAME = 'price'
);
SET @price_sql := IF(
  @price_exists = 0,
  'ALTER TABLE custom_jerseys ADD COLUMN price DECIMAL(10, 2) NULL AFTER design_data',
  'SELECT 1'
);
PREPARE price_stmt FROM @price_sql;
EXECUTE price_stmt;
DEALLOCATE PREPARE price_stmt;

SET @updated_at_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'custom_jerseys'
    AND COLUMN_NAME = 'updated_at'
);
SET @updated_at_sql := IF(
  @updated_at_exists = 0,
  'ALTER TABLE custom_jerseys ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
  'SELECT 1'
);
PREPARE updated_at_stmt FROM @updated_at_sql;
EXECUTE updated_at_stmt;
DEALLOCATE PREPARE updated_at_stmt;

SET @base_product_index_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'custom_jerseys'
    AND INDEX_NAME = 'idx_custom_jerseys_base_product_id'
);
SET @base_product_index_sql := IF(
  @base_product_index_exists = 0,
  'ALTER TABLE custom_jerseys ADD INDEX idx_custom_jerseys_base_product_id (base_product_id)',
  'SELECT 1'
);
PREPARE base_product_index_stmt FROM @base_product_index_sql;
EXECUTE base_product_index_stmt;
DEALLOCATE PREPARE base_product_index_stmt;

SET @fk_base_product_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'fk_custom_jerseys_base_product'
    AND TABLE_NAME = 'custom_jerseys'
);
SET @fk_base_product_sql := IF(
  @fk_base_product_exists = 0,
  'ALTER TABLE custom_jerseys ADD CONSTRAINT fk_custom_jerseys_base_product FOREIGN KEY (base_product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE fk_base_product_stmt FROM @fk_base_product_sql;
EXECUTE fk_base_product_stmt;
DEALLOCATE PREPARE fk_base_product_stmt;
