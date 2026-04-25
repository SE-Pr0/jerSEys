import React, { useEffect, useRef, useState } from 'react';

const RevealSection = ({ as: Component = 'div', className = '', children, threshold = 0.18 }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={sectionRef}
      className={`${className} reveal${isVisible ? ' visible' : ''}`.trim()}
    >
      {children}
    </Component>
  );
};

export default RevealSection;
