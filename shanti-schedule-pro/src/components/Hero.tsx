import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Bell, BarChart } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import ParallaxDecor from '@/components/ParallaxDecor';

const Hero = () => {
  const stats = [
    { label: 'Centers Served', value: 500, suffix: '+' },
    { label: 'Patients Managed', value: 50000, suffix: '+' },
    { label: 'Uptime', value: 99.9, suffix: '%' }
  ];
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const section = document.getElementById('hero');
    if (!section || hasAnimated.current) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // animate values
          stats.forEach((s, idx) => {
            const duration = 1200; // ms
            const start = performance.now();
            const animate = (t: number) => {
              const progress = Math.min(1, (t - start) / duration);
              setAnimatedValues(prev => {
                const next = [...prev];
                next[idx] = s.value * progress;
                return next;
              });
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          });
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [stats]);

  return (
    <section id="hero" className="relative min-h-screen bg-gradient-healing flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50" />
      <ParallaxDecor
        layers={[
          { shape: 'circle', size: 480, speed: 0.18, colorClass: 'bg-primary/15', className: '-top-40 -left-40' },
          { shape: 'blob', size: 560, speed: 0.26, colorClass: 'bg-accent/25', className: 'top-1/3 -right-56', blur: 'blur-3xl' },
          { shape: 'ring', size: 420, speed: 0.22, colorClass: 'bg-transparent', className: 'bottom-10 left-1/2 -translate-x-1/2 border-primary/30', blur: 'blur' },
          { shape: 'diamond', size: 300, speed: 0.34, colorClass: 'bg-success/15', className: 'bottom-28 right-1/3', rotate: 45 }
        ]}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-accent/20 rounded-full">
                <span className="text-sm font-medium text-accent-foreground">
                  Ministry of AYUSH Approved
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Modern
                <span className="text-primary block">Panchakarma</span>
                Management
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Revolutionize your Ayurvedic practice with intelligent scheduling, 
                real-time tracking, and seamless patient management.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Automated Scheduling
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Smart Notifications
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Progress Tracking
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Real-time Updates
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary text-lg px-8">
                Start Free Trial
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="text-lg px-8 flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Product Demo</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                      title="Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              {stats.map((s, i) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {s.label === 'Patients Managed'
                      ? `${Math.round(animatedValues[i] / 1000)}K${s.suffix}`
                      : `${s.label === 'Uptime' ? animatedValues[i].toFixed(1) : Math.round(animatedValues[i])}${s.suffix}`}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="Modern Panchakarma management software interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-card rounded-xl shadow-medium p-4 border border-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Live Tracking</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-medium p-4 border border-border">
              <div className="text-sm font-medium text-foreground">
                Next Session: <span className="text-primary">2:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;