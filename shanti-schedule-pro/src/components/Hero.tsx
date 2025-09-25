import { Button } from '@/components/ui/button';
import { Play, Calendar, Bell, BarChart } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-healing flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50" />
      
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
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Centers Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Patients Managed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
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