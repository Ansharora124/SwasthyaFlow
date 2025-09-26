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

    let radius = Math.max(300, Math.floor(ring.clientWidth / 2));

    const positionSlides = () => {
      radius = Math.max(240, Math.floor(ring.clientWidth / 2));
      Array.from(ring.children).forEach((child, i) => {
        (child as HTMLElement).style.transform = `rotateY(${i * angleStep}deg) translateZ(${radius}px)`;
      });
    };
    positionSlides();

    if (prefersReduced) return; // Skip animated rotation

    let running = true;
    let current = 0; // smoothed rotation
    let target = 0;  // target rotation

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const calcTarget = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Progress from when the top hits the bottom of viewport to when the bottom leaves the top
      const totalSpan = vh + rect.height; // span of travel while visible
      const passed = vh - rect.top; // pixels progressed into the span
      const raw = passed / totalSpan; // can be <0 or >1, clamp to 0..1
      const progress = clamp01(raw);
      const eased = easeInOutCubic(progress);
      // Rotate 1.5 turns across the scroll passage with easing
      target = eased * 540; // degrees
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (!running) return;
      calcTarget();
      current = lerp(current, target, 0.06); // smoother interpolation
      ring.style.transform = `translateZ(-${radius}px) rotateY(${current}deg)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const onResize = () => {
      positionSlides();
    };
    window.addEventListener('resize', onResize);
    return () => { running = false; window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div ref={containerRef} className="three-d-slider relative mt-4">
      <div className="three-d-slider-gradient pointer-events-none" />
      <div className="three-d-ring" ref={ringRef} aria-label="3D product media showcase">
        {slides.map((s, i) => (
          <figure key={i} className="three-d-slide shadow-medium">
            <img src={s.src} alt={s.alt} loading="lazy" className="three-d-img"/>
            <figcaption className="three-d-caption">{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

export default ThreeDScrollSlider;
