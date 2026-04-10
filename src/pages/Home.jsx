import React from 'react';
import HeroSection from '../components/home/HeroSection';
import HomeCatalogSection from '../components/home/HomeCatalogSection';
import MarqueeSection from '../components/home/MarqueeSection';
import FeaturesStrip from '../components/home/FeaturesStrip';

const Home = () => {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <HomeCatalogSection />
      <FeaturesStrip />
    </>
  );
};

export default Home;
