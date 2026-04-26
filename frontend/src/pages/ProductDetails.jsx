import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { StateBlock } from '../components/ui';
import { addCartItem } from '../services/cartService';
import { showToast } from '../services/notificationService';
import { fetchProductById, getRelatedShopProducts } from '../services/productService';
import { getStoredUser } from '../utils/auth';
import '../styles/product-details.css';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const detailHighlights = [
  {
    title: 'Match Day Feel',
    copy: 'Lightweight fabric, clean print work, and a ready-to-wear fit.',
  },
  {
    title: 'Fast Pick Up',
    copy: 'Choose your size, check stock, and move straight to checkout.',
  },
  {
    title: 'Trusted Drop',
    copy: 'Catalogued from verified jersey sources with live product links.',
  },
];

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [personalize, setPersonalize] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relatedProducts = useMemo(() => getRelatedShopProducts(productId, 4), [productId]);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextProduct = await fetchProductById(productId);
        if (!isMounted) {
          return;
        }

        setProduct(nextProduct);
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Failed to fetch product.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] || '');
    setQuantity(1);
    setPersonalize(false);
    setPlayerName('');
    setPlayerNumber('');
    setNotice('');
  }, [product]);

  if (isLoading) {
    return (
      <div className="product-details-page">
        <section className="product-details-empty section-wrap">
          <StateBlock centered icon="..." title="Loading product" description="Fetching product details from the backend." />
        </section>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="product-details-page">
        <section className="product-details-empty section-wrap">
          <p className="product-details-kicker">Product not found</p>
          <h1>That jersey slipped past the back line.</h1>
          <p>{loadError || 'Try the shop catalog again and pick another listing.'}</p>
          <Link className="product-details-outline" to="/shop">
            Back To Shop
          </Link>
        </section>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!getStoredUser()) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      });
      return;
    }

    if (!selectedSize && product.sizes.length > 0) {
      setNotice('Choose a size first.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addCartItem({
        productId: product.backendId || product.id,
        quantity,
        product,
        selectedSize,
        playerName: firstText(playerName),
        playerNumber: firstText(playerNumber),
      });

      setNotice('');
      showToast({
        message: 'Added to cart!',
        subtext: `${product.name}${selectedSize ? ` in ${selectedSize}` : ''}`,
      });
    } catch (error) {
      setNotice(error.message || 'Failed to add to cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((currentQuantity) => Math.min(currentQuantity + 1, 9));
  };

  const decrementQuantity = () => {
    setQuantity((currentQuantity) => Math.max(currentQuantity - 1, 1));
  };

  return (
    <div className="product-details-page">
      <section className="product-details-hero">
        <div className="product-details-bg" />
        <div className="product-details-grid section-wrap">
          <div className="product-details-gallery">
            <Link className="product-details-back" to="/shop">
              Back To Shop
            </Link>
            <div className="product-details-image-stage">
              <img src={product.image} alt={product.name} />
              {product.badge && <span className={`product-details-badge is-${product.badge}`}>{product.badge}</span>}
            </div>
          </div>

          <div className="product-details-info">
            <div className="product-details-rating">
              <span className="product-details-stars">★★★★★</span>
              <span>(4+ reviews)</span>
            </div>
            <p className="product-details-kicker">{product.team}</p>
            <h1>{product.name}</h1>

            <div className="product-details-price-row">
              <span className="product-details-price">{formatPrice(product.price)}</span>
              <span className="product-details-price-old">{formatPrice(product.price + 10)}</span>
              <span className="product-details-sale">Sale</span>
              <span className={`product-details-stock${product.inStock ? ' is-in-stock' : ''}`}>
                {product.inStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>

            <ul className="product-details-feature-list" aria-label="Product highlights">
              <li>Top tier fabric</li>
              <li>DRI-fit technology</li>
              <li>Heat pressed printing</li>
            </ul>

            <div className="product-details-panel">
              <div className="product-details-option-header">
                <span>Size: {selectedSize || 'None selected'}</span>
                <a href="#product-description">Size Guide</a>
              </div>

              <div className="product-details-size-grid">
                {product.sizes.length > 0 ? (
                  product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`product-details-size${selectedSize === size ? ' is-selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="product-details-unavailable">No sizes listed right now.</span>
                )}
              </div>

              <div className="product-details-personalize">
                <span className="product-details-personalize-label">Personalize</span>

                <label className="product-details-personalize-toggle">
                  <input
                    type="checkbox"
                    checked={personalize}
                    onChange={(event) => setPersonalize(event.target.checked)}
                  />
                  <span className="product-details-personalize-check" aria-hidden="true" />
                  <span>Enter Name &amp; Number (FREE):</span>
                </label>

                <div className={`product-details-personalize-fields${personalize ? ' is-open' : ''}`}>
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value.toUpperCase())}
                      placeholder="YOUR NAME"
                      maxLength="14"
                      tabIndex={personalize ? 0 : -1}
                    />
                  </label>
                  <label>
                    <span>Number</span>
                    <input
                      type="text"
                      value={playerNumber}
                      onChange={(event) => setPlayerNumber(event.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="10"
                      inputMode="numeric"
                      tabIndex={personalize ? 0 : -1}
                    />
                  </label>
                </div>
              </div>

              <div className="product-details-buy-row">
                <span className="product-details-quantity-label">Quantity</span>
                <div className="product-details-quantity" aria-label="Quantity selector">
                  <button type="button" onClick={decrementQuantity} aria-label="Decrease quantity">
                    -
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={incrementQuantity} aria-label="Increase quantity">
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="product-details-add"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isSubmitting}
                >
                  {product.inStock ? (isSubmitting ? 'Adding...' : 'Add to cart') : 'Unavailable'}
                </button>
              </div>

              {notice && <p className="product-details-notice">{notice}</p>}
            </div>
          </div>
        </div>
      </section>

      <section id="product-description" className="product-details-description-block section-wrap">
        <div>
          <p className="product-details-kicker">Description</p>
          <h2>Product Details</h2>
        </div>
        <div>
          <p>{product.description}</p>
        </div>
      </section>

      <section className="product-details-service section-wrap">
        {detailHighlights.map((highlight) => (
          <article key={highlight.title} className="product-details-service-item">
            <h2>{highlight.title}</h2>
            <p>{highlight.copy}</p>
          </article>
        ))}
      </section>

      <section className="product-details-related section-wrap">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Keep Browsing</div>
            <h2 className="section-title">
              Related <span>Kits</span>
            </h2>
          </div>
        </div>

        <div className="product-details-related-grid">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="product-details-related-link">
              <ProductCard
                sport={relatedProduct.sportLabel}
                club={relatedProduct.team}
                name={relatedProduct.name}
                price={relatedProduct.price.toFixed(2)}
                sizes={relatedProduct.sizes.slice(0, 4)}
                badge={relatedProduct.badge}
                image={relatedProduct.image}
                actionLabel="View Listing"
                onAction={() => navigate(`/shop/${relatedProduct.id}`)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
