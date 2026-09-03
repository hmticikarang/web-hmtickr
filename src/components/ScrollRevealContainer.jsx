'use client';

import { useEffect, useRef } from 'react';

export default function ScrollRevealContainer({
  children,
  selector,
  options = {},
  className = '',
  as: Tag = 'div',
  triggerKey,
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Import scrollreveal dinamis untuk memastikan aman dari SSR Next.js
    import('scrollreveal').then((module) => {
      if (!isMounted) return;

      const ScrollReveal = module.default;
      const sr = ScrollReveal();

      const defaultOptions = {
        duration: 800,
        distance: '30px',
        easing: 'ease-out',
        origin: 'bottom',
        reset: false,
        ...options,
      };

      if (selector && containerRef.current) {
        const elements = containerRef.current.querySelectorAll(selector);
        if (elements.length > 0) {
          sr.reveal(elements, defaultOptions);
        }
      } else if (containerRef.current) {
        sr.reveal(containerRef.current, defaultOptions);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selector, JSON.stringify(options), triggerKey]);

  return (
    <Tag ref={containerRef} className={className} {...props}>
      {children}
    </Tag>
  );
}
