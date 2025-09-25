import { useParallaxScroll } from '@/hooks/useParallaxScroll';
import { useId } from 'react';

export interface ParallaxLayerDef {
  className?: string;
  speed?: number; // 0.1 - 0.6 typical
  style?: React.CSSProperties;
  shape?: 'circle' | 'diamond' | 'blob' | 'ring';
  colorClass?: string; // tailwind bg-* utilities
  size?: number; // px
  blur?: string; // e.g. 'blur-2xl'
  opacity?: string; // e.g. 'opacity-50'
  rotate?: number; // deg for diamond
}

interface Props {
  layers: ParallaxLayerDef[];
  className?: string;
}

// Simple shape utility (pure CSS, no external assets)
function Shape({ def, id }: { def: ParallaxLayerDef; id: string }) {
  const {
    shape = 'circle',
    className = '',
    speed = 0.25,
    size = 280,
    colorClass = 'bg-primary/10',
    blur = 'blur-2xl',
    opacity = '',
    rotate = 0,
    style
  } = def;

  const base = `parallax-layer absolute pointer-events-none select-none ${colorClass} ${blur} ${opacity} ${className}`;
  const dim: React.CSSProperties = { width: size, height: size, ...style };
  let extra: string = '';
  if (shape === 'circle') extra = 'rounded-full';
  if (shape === 'diamond') extra = 'rounded-lg';
  if (shape === 'ring') extra = 'rounded-full border border-primary/30 bg-transparent';
  if (shape === 'blob') extra = 'rounded-[45%]';

  return (
    <div
      aria-hidden
      id={id}
      data-speed={speed}
      className={`${base} ${extra}`}
      style={{
        transform: 'translate3d(0,0,0)',
        rotate: shape === 'diamond' ? `${rotate}deg` : undefined,
        mixBlendMode: 'multiply',
        ...dim,
      }}
    />
  );
}

export const ParallaxDecor = ({ layers, className = '' }: Props) => {
  useParallaxScroll();
  const prefix = useId();
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {layers.map((l, i) => (
        <Shape key={`${prefix}-${i}`} def={l} id={`${prefix}-${i}`} />
      ))}
    </div>
  );
};

export default ParallaxDecor;
