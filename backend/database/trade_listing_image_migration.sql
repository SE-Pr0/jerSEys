SET @image_url_column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'trade_listings'
    AND COLUMN_NAME = 'image_url'
);

SET @trade_listing_image_sql := IF(
  @image_url_column_exists = 0,
  'ALTER TABLE trade_listings ADD COLUMN image_url LONGTEXT NULL AFTER description',
  'SELECT 1'
);

PREPARE trade_listing_image_stmt FROM @trade_listing_image_sql;
EXECUTE trade_listing_image_stmt;
DEALLOCATE PREPARE trade_listing_image_stmt;
