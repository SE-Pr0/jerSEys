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

INSERT INTO products (name, description, price, stock, category)
VALUES
  (
    'Real Madrid 24/25 Home Jersey',
    'Official-style white home jersey inspired by the 2024/25 season.',
    89.99,
    25,
    'Football'
  ),
  (
    'Barcelona 24/25 Away Jersey',
    'Modern away jersey with breathable fabric and club-inspired accents.',
    84.99,
    18,
    'Football'
  ),
  (
    'Los Angeles Lakers Icon Edition Jersey',
    'Purple basketball jersey inspired by the Lakers icon edition.',
    94.50,
    12,
    'Basketball'
  ),
  (
    'Argentina Classic Retro Jersey',
    'Retro national team jersey with vintage styling and stitched crest.',
    79.00,
    20,
    'Retro'
  ),
  (
    'Custom Blank Training Jersey',
    'Minimal blank jersey suitable for customization and personalized designs.',
    49.99,
    40,
    'Custom'
  );
