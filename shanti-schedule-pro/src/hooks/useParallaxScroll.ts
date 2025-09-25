import { useEffect } from 'react';

/**
 * Lightweight parallax system: any element with class 'parallax-layer' and a
 * data-speed attribute (e.g. data-speed="0.3") will translate vertically at a
 * different rate relative to scroll position. Positive speed moves slower than scroll.
 */
export function useParallaxScroll(options?: { selector?: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sel = options?.selector || '.parallax-layer';
    const layers: NodeListOf<HTMLElement> = document.querySelectorAll(sel);
    if (!layers.length) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const viewportH = window.innerHeight;
        const scrollY = window.scrollY;
        layers.forEach(layer => {
          const speedAttr = layer.getAttribute('data-speed');
            if (!speedAttr) return;
            const speed = parseFloat(speedAttr); // typical range 0.1 - 0.6
            const rect = layer.getBoundingClientRect();
            const elementTop = rect.top + scrollY; // absolute top
            const centerOffset = (scrollY + viewportH / 2) - (elementTop + rect.height / 2);
            const translateY = -centerOffset * speed * 0.15; // scale multiplier
            layer.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
        });
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [options?.selector]);
}
