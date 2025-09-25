import { useEffect, useRef } from 'react';
import dashboardPreview from '@/assets/dashboard-preview.jpg';
import heroImage from '@/assets/hero-image.jpg';
import patientApp from '@/assets/patient-app.jpg';

interface SlideDef { src: string; alt: string; caption: string }
const slides: SlideDef[] = [
  { src: dashboardPreview, alt: 'Dashboard Preview', caption: 'Operational Analytics' },
  { src: heroImage, alt: 'Therapy Environment', caption: 'Healing Experience' },
  { src: patientApp, alt: 'Patient Mobile App', caption: 'Patient Engagement' },
  { src: dashboardPreview, alt: 'Scheduling System', caption: 'Smart Scheduling' },
  { src: patientApp, alt: 'Progress Tracking', caption: 'Recovery Tracking' }
];

// 3D scroll-driven carousel: rotates a ring of images based on scroll progress of its viewport segment.
const ThreeDScrollSlider = () => {
  const containerRef = useRef<HTMLDivElement|null>(null);
  const ringRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const ring = ringRef.current;
    if (!container || !ring) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = slides.length;
    const angleStep = 360 / total;

    // Pre-position slides around cylinder
    Array.from(ring.children).forEach((child, i) => {
      (child as HTMLElement).style.transform = `rotateY(${i * angleStep}deg) translateZ(520px)`;
    });

    if (prefersReduced) return; // Skip animated rotation

    let running = true;
    let current = 0; // smoothed rotation
    let target = 0;  // target rotation

    const calcTarget = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Map center crossing to progress (0 when top well below, 1 when bottom leaves)
      const visiblePortion = Math.min(vh, Math.max(0, vh - rect.top));
      // Use distance of container center from viewport center for stable mapping
      const centerDelta = (rect.top + rect.height / 2) - (vh / 2);
      const norm = 1 - Math.min(1, Math.max(-1, centerDelta / (vh))); // -1..1 -> 0..2 -> clamp -> invert-ish
      const progress = Math.min(1, Math.max(0, norm));
      // 1.5 full turns across scroll passage
      target = progress * 540; // degrees
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (!running) return;
      calcTarget();
      current = lerp(current, target, 0.08); // smoothing factor
      ring.style.transform = `translateZ(-480px) rotateY(${current}deg)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { running = false; };
  }, []);

  return (
    <div ref={containerRef} className="three-d-slider relative mt-24 mb-12">
      <div className="three-d-slider-gradient pointer-events-none" />
      <div className="three-d-ring" ref={ringRef} aria-label="3D product media showcase">
        {slides.map((s, i) => (
          <figure key={i} className="three-d-slide shadow-medium">
            <img src={s.src} alt={s.alt} loading="lazy" className="three-d-img"/>
            <figcaption className="three-d-caption">{s.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="text-center mt-10 space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Immersive Platform Preview</h3>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">Scroll to rotate the 3D carousel and explore core product surfaces: analytics, therapy environment, patient engagement, scheduling and recovery tracking.</p>
      </div>
    </div>
  );
};

export default ThreeDScrollSlider;
