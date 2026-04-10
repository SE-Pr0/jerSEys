import React from 'react';
import '../../styles/home-marquee.css';

const marqueeItems = [
  { label: 'Football Kits', highlight: true },
  { label: 'Basketball Jerseys', highlight: false },
  { label: 'Custom Designs', highlight: true },
  { label: 'Jersey Trading', highlight: false },
  { label: 'Club & National Teams', highlight: true },
  { label: 'Authentic Kits', highlight: false },
];

const MarqueeSection = () => {
  const renderItems = (prefix) =>
    marqueeItems.flatMap((item, index) => [
      <div key={`${prefix}-${item.label}-${index}`} className={`marquee-item${item.highlight ? ' highlight' : ''}`}>
        {item.label}
      </div>,
      <div key={`${prefix}-${item.label}-dot-${index}`} className="marquee-dot" />,
    ]);

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {renderItems('first')}
        {renderItems('second')}
      </div>
    </div>
  );
};

export default MarqueeSection;
