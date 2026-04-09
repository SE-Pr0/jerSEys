import React from 'react';
import HeroSection from '../components/home/HeroSection';
import MarqueeSection from '../components/home/MarqueeSection';
import FeaturesStrip from '../components/home/FeaturesStrip';

const Home = () => {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <FeaturesStrip />
    </>
  );
};

export default Home;
