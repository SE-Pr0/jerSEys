import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import brazilKit from '../../../assets/images/Brazil Nike Floating.png';
import '../../styles/home-hero.css';

const CountUpStat = ({ target, suffix = '', duration = 1800, start = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return undefined;
    }

    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, start]);

  return (
    <div className="stat-num">
      {count}
      <span>{suffix}</span>
    </div>
  );
};

const HeroSection = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const node = statsRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.45,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-eyebrow">New Season Drop 2026</div>
          <h1 className="hero-title">
            YOUR
            <br />
            <span className="line-red">GAME.</span>
            <br />
            <span className="line-outline">YOUR KIT.</span>
          </h1>
          <p className="hero-sub">
            Browse, customize, and trade premium football and basketball jerseys. Authentic kits from top clubs,
            styled to feel as sharp as match day.
          </p>
          <div className="hero-ctas">
            <Link to="/shop" className="cta-primary">
              Shop Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="/shop#shop-insights" className="cta-secondary">Explore The Drop</a>
          </div>
          <div
            ref={statsRef}
            className={`hero-stats ${statsVisible ? 'is-visible' : ''}`}
          >
            <div className="stat">
              <CountUpStat target={500} suffix="+" start={statsVisible} />
              <div className="stat-label">Jerseys</div>
            </div>
            <div className="stat">
              <CountUpStat target={50} suffix="+" start={statsVisible} />
              <div className="stat-label">Clubs</div>
            </div>
            <div className="stat">
              <CountUpStat target={24} suffix="/7" start={statsVisible} />
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-ring2" />
          <div className="hero-visual-ring" />
          <div className="hero-jersey-showcase">
            <div className="jersey-card-hero">
              <div className="jersey-card-img">
                <img
                  src={brazilKit}
                  alt="Brazil Home Shirt"
                  className="hero-jersey-image"
                />
                <div className="floating-badge badge-new">New</div>
                <div className="floating-badge badge-hot">Hot</div>
              </div>
              <div className="jersey-card-info">
                <div className="jersey-card-sport">Football Kit</div>
                <div className="jersey-card-name">Brazil Home Shirt World Cup 2026</div>
                <div className="jersey-card-price">$89.99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
