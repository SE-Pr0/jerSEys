USE jerseys_db;

INSERT INTO users (name, email, password, role, is_verified)
VALUES
  (
    'Admin User',
    'admin@jerseys.com',
    '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv',
    'admin',
    TRUE
  ),
  (
    'Kareem Haddad',
    'kareem@example.com',
    '$2b$10$zyxwvutsrqponmlkjihgfedcba0987654321zyxwvutsrqponmlkj',
    'user',
    TRUE
  ),
  (
    'Lina Nasser',
    'lina@example.com',
    '$2b$10$mnopqrstuvabcdefghijkl1234567890mnopqrstuvabcdefghijkl',
    'user',
    FALSE
  );

INSERT INTO products (name, description, price, stock, category, team, sport, size, image_url)
VALUES
  (
    'Real Madrid 24/25 Home Jersey',
    'Official-style white home jersey inspired by the 2024/25 season.',
    89.99,
    25,
    'Football',
    'Real Madrid',
    'Football',
    'L',
    'https://example.com/images/real-madrid-home.jpg'
  ),
  (
    'Barcelona 24/25 Away Jersey',
    'Modern away jersey with breathable fabric and club-inspired accents.',
    84.99,
    18,
    'Football',
    'Barcelona',
    'Football',
    'M',
    'https://example.com/images/barcelona-away.jpg'
  ),
  (
    'Los Angeles Lakers Icon Edition Jersey',
    'Purple basketball jersey inspired by the Lakers icon edition.',
    94.50,
    12,
    'Basketball',
    'Los Angeles Lakers',
    'Basketball',
    'XL',
    'https://example.com/images/lakers-icon.jpg'
  ),
  (
    'Argentina Classic Retro Jersey',
    'Retro national team jersey with vintage styling and stitched crest.',
    79.00,
    20,
    'Retro',
    'Argentina',
    'Football',
    'M',
    'https://example.com/images/argentina-retro.jpg'
  ),
  (
    'Custom Blank Training Jersey',
    'Minimal blank jersey suitable for customization and personalized designs.',
    49.99,
    40,
    'Custom',
    'Generic',
    'Training',
    'L',
    'https://example.com/images/blank-training.jpg'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
VALUES
  (1, 'https://example.com/images/real-madrid-home.jpg', 'Real Madrid home jersey front view', TRUE, 0),
  (2, 'https://example.com/images/barcelona-away.jpg', 'Barcelona away jersey front view', TRUE, 0),
  (3, 'https://example.com/images/lakers-icon.jpg', 'Lakers icon edition jersey front view', TRUE, 0),
  (4, 'https://example.com/images/argentina-retro.jpg', 'Argentina retro jersey front view', TRUE, 0),
  (5, 'https://example.com/images/blank-training.jpg', 'Blank training jersey front view', TRUE, 0);
