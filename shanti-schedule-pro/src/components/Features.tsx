import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useParallaxScroll } from '@/hooks/useParallaxScroll';
import ParallaxDecor from '@/components/ParallaxDecor';
import ThreeDScrollSlider from '@/components/ThreeDScrollSlider';
import { 
  Calendar, 
  Bell, 
  BarChart, 
  Users, 
  Shield, 
  Smartphone,
  Clock,
  FileText,
  Activity
} from 'lucide-react';

const Features = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // restart animation by removing and re-adding (in case it was visible before)
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.35 });
    cards.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  // Activate parallax for decorative layers
  useParallaxScroll();
  const features = [
    {
      icon: Calendar,
      title: "Automated Therapy Scheduling",
      description: "Intelligent scheduling system that automatically plans and manages therapy sessions for optimal patient outcomes.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Bell,
      title: "Smart Notification System",
      description: "Automated alerts for pre and post-procedure precautions via in-app, SMS, and email notifications.",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: BarChart,
      title: "Real-Time Progress Tracking",
      description: "Visual progress tracking with graphs and charts to monitor patient improvements and therapy effectiveness.",
      color: "bg-success/10 text-success"
    },
    {
      icon: Users,
      title: "Patient & Practitioner Portals",
      description: "Dedicated interfaces for both patients and practitioners with role-based access and functionality.",
      color: "bg-warning/10 text-warning"
    },
    {
      icon: Activity,
      title: "Integrated Feedback Loop",
      description: "Enable patients to report symptoms and improvements, refining treatment schedules automatically.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: FileText,
      title: "Digital Documentation",
      description: "Comprehensive digital records management replacing manual documentation with secure, searchable files.",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Shield,
      title: "Secure Data Management",
      description: "HIPAA-compliant security ensuring patient data privacy and regulatory compliance.",
      color: "bg-success/10 text-success"
    },
    {
      icon: Smartphone,
      title: "Multi-Platform Access",
      description: "Access your practice management tools from any device - desktop, tablet, or mobile.",
      color: "bg-warning/10 text-warning"
    },
    {
      icon: Clock,
      title: "Recovery Milestones",
      description: "Personalized recovery tracking with milestone notifications to keep patients motivated.",
      color: "bg-primary/10 text-primary"
    }
  ];

  return (
    <section id="features" className="relative py-20 bg-gradient-healing overflow-hidden">
      <ParallaxDecor
        layers={[
          { shape: 'circle', size: 420, speed: 0.22, colorClass: 'bg-primary/15', className: '-top-44 -left-40' },
          { shape: 'blob', size: 520, speed: 0.18, colorClass: 'bg-accent/20', className: 'top-1/3 -right-52', blur: 'blur-3xl' },
            { shape: 'ring', size: 380, speed: 0.28, colorClass: 'bg-transparent', className: 'bottom-10 left-1/4 border-primary/30', blur: 'blur' },
          { shape: 'diamond', size: 260, speed: 0.35, colorClass: 'bg-success/15', className: 'bottom-32 right-1/3', rotate: 45 },
          { shape: 'circle', size: 300, speed: 0.30, colorClass: 'bg-primary/10', className: 'top-1/2 left-1/2 -translate-x-1/2', blur: 'blur-2xl' }
        ]}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Comprehensive Panchakarma Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From automated scheduling to real-time progress tracking, our software integrates 
            traditional Ayurvedic authenticity with modern healthcare efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card fade-up border-border hover:shadow-medium transition-shadow duration-300 hover:-translate-y-1 bg-card"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

  {/* 3D Scroll Slider */}
  <ThreeDScrollSlider />

  {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-card rounded-2xl p-8 shadow-medium border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of Ayurvedic centers already using PanchaCare to deliver 
              exceptional patient care with modern efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-medium hover:shadow-medium transition-all">
                Schedule Demo
              </button>
              <button className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;