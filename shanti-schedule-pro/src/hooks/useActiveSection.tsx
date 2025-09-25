import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view (by id) using IntersectionObserver.
 * Returns the active section id.
 */
export function useActiveSection(sectionIds: string[], offset: number = 0) {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return; // graceful degradation

    const observers: IntersectionObserver[] = [];
    const handleIntersect: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    };

    const options: IntersectionObserverInit = {
      // Use rootMargin to trigger a bit earlier
      root: null,
      rootMargin: `-${offset}px 0px -55% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const observer = new IntersectionObserver(handleIntersect, options);
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sectionIds, offset]);

  return active;
}
