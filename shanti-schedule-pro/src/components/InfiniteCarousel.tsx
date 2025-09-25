import { ReactNode, useMemo } from 'react';

interface CarouselItem {
  icon?: ReactNode;
  label: string;
  value?: string;
  accent?: 'primary' | 'success' | 'warning' | 'accent';
}

interface InfiniteCarouselProps {
  items: CarouselItem[];
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  title?: string;
}

const accentClass: Record<NonNullable<CarouselItem['accent']>, string> = {
  primary: 'bg-primary/15 text-primary border-primary/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  accent: 'bg-accent/20 text-accent-foreground border-accent/30'
};

export const InfiniteCarousel = ({ items, direction='left', speed='normal', className='', title }: InfiniteCarouselProps) => {
  // Duplicate sequence for seamless loop
  const sequence = useMemo(() => [...items, ...items], [items]);
  return (
    <div className={`infinite-carousel ${className}`} data-direction={direction} data-speed={speed}>
      {title && (
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
          <span className="text-[10px] text-muted-foreground">Auto-scroll • Hover to pause</span>
        </div>
      )}
      <div className="infinite-carousel-track">
        {sequence.map((it, idx) => (
          <div
            key={idx+it.label}
            className={`flex items-center gap-3 min-w-[240px] px-4 py-3 border-r border-border/60 bg-card/40 hover:bg-card/70 transition-colors ${it.accent ? accentClass[it.accent] : ''}`}
          >
            {it.icon && <div className="shrink-0">{it.icon}</div>}
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground truncate">{it.label}</p>
              {it.value && <p className="text-[11px] text-muted-foreground truncate">{it.value}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;
