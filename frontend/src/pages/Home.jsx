import React from 'react';
import HeroSection from '../components/home/HeroSection';
import HomeCatalogSection from '../components/home/HomeCatalogSection';
import MarqueeSection from '../components/home/MarqueeSection';
import FeaturesStrip from '../components/home/FeaturesStrip';
import RevealSection from '../components/home/RevealSection';

const Home = () => {
  return (
    <>
      <HeroSection />
      <RevealSection as="section">
        <MarqueeSection />
      </RevealSection>
      <section>
        <HomeCatalogSection />
      </section>
      <RevealSection as="section">
        <FeaturesStrip />
      </RevealSection>
    </>
  );
};

export default Home;
