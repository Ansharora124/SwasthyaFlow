import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Bell, 
  Activity, 
  Clock, 
  CheckCircle, 
  Heart,
  Smartphone,
  Star,
  MessageSquare
} from 'lucide-react';
import patientApp from '@/assets/patient-app.jpg';

const PatientPortal = () => {
  useEffect(() => {
    const items = document.querySelectorAll('.patient-reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
    items.forEach(i => observer.observe(i));
    return () => observer.disconnect();
  }, []);
  const upcomingTherapies = [
    { 
      name: "Abhyanga (Oil Massage)", 
      date: "Tomorrow", 
      time: "10:00 AM", 
      status: "confirmed",
      preparation: "Fast for 2 hours before session"
    },
    { 
      name: "Shirodhara", 
      date: "Oct 28", 
      time: "11:30 AM", 
      status: "scheduled",
      preparation: "Avoid heavy meals"
    },
    { 
      name: "Swedana (Steam Therapy)", 
      date: "Oct 30", 
      time: "2:00 PM", 
      status: "scheduled",
      preparation: "Stay hydrated"
    }
  ];

  const notifications = [
    { 
      message: "Pre-session reminder: Avoid heavy meals 3 hours before your Abhyanga session", 
      time: "2 hours ago",
      type: "preparation"
    },
    { 
      message: "Post-session care: Rest for 30 minutes after your last therapy", 
      time: "1 day ago",
      type: "aftercare"
    },
    { 
      message: "Your therapy progress has improved by 15% this week!", 
      time: "2 days ago",
      type: "progress"
    }
  ];

  return (
    <section id="patients" className="py-20 bg-gradient-healing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Patient Portal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empower your patients with easy access to their therapy schedules, 
            progress tracking, and personalized care instructions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mobile App Preview */}
          <div className="relative">
            <div className="relative">
              <img 
                src={patientApp} 
                alt="Patient mobile app interface"
                className="w-full max-w-md mx-auto rounded-3xl shadow-strong"
              />
              
              {/* Floating notification */}
              <div className="absolute top-20 -right-4 bg-card rounded-xl shadow-medium p-4 border border-border max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Therapy Reminder</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Abhyanga session is tomorrow at 10:00 AM
                </p>
              </div>

              {/* Progress indicator */}
              <div className="absolute bottom-20 -left-4 bg-card rounded-xl shadow-medium p-4 border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">Recovery Progress</span>
                </div>
                <Progress value={78} className="h-2 w-24" />
                <p className="text-xs text-muted-foreground mt-1">78% Complete</p>
              </div>
            </div>
          </div>

          {/* Patient Portal Features */}
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            <Card className="border-border bg-card patient-reveal reveal">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Therapies
                  </CardTitle>
                  <Badge variant="secondary">3 scheduled</Badge>
                </div>
                <CardDescription>
                  Your personalized therapy schedule and preparation instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTherapies.map((therapy, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{therapy.name}</h4>
                          <p className="text-sm text-muted-foreground">{therapy.date} at {therapy.time}</p>
                        </div>
                        <Badge variant={therapy.status === 'confirmed' ? 'default' : 'secondary'}>
                          {therapy.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-warning">
                        <Bell className="h-4 w-4" />
                        <span>{therapy.preparation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Smart Notifications */}
            <Card className="border-border bg-card patient-reveal reveal">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Smart Notifications
                </CardTitle>
                <CardDescription>
                  Personalized reminders and care instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'progress' ? 'bg-success' : 
                        notification.type === 'preparation' ? 'bg-warning' : 'bg-primary'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="border-border bg-card patient-reveal reveal">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Recovery Progress
                </CardTitle>
                <CardDescription>
                  Track your healing journey with visual milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">78%</div>
                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Star className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">12</div>
                    <div className="text-sm text-muted-foreground">Sessions Completed</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Energy Levels</span>
                      <span className="text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Sleep Quality</span>
                      <span className="text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Stress Reduction</span>
                      <span className="text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-12 bg-gradient-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
              <Button variant="outline" className="h-12">
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Mobile-First Design</h3>
            <p className="text-muted-foreground">
              Optimized for mobile devices with intuitive touch interfaces and offline access
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Smart Reminders</h3>
            <p className="text-muted-foreground">
              Automated notifications for sessions, medications, and lifestyle recommendations
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Visual progress indicators and milestone celebrations to keep patients motivated
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientPortal;