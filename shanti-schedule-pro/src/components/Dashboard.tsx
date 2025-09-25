import { useEffect } from 'react';
import { useState, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  Bell,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// Replaced static image with live analytics component
import AnalyticsInsights from '@/components/AnalyticsInsights';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.dash-reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.25 });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const todayISO = useMemo(() => new Date().toISOString().slice(0,10), []);
  const [sessions, setSessions] = usePersistentState(
    'dashboard.sessions',
    [
      { patient: "Priya Sharma", therapy: "Abhyanga", time: "10:00 AM", date: todayISO, status: "confirmed" },
      { patient: "Raj Patel", therapy: "Shirodhara", time: "11:30 AM", date: todayISO, status: "pending" },
      { patient: "Maya Singh", therapy: "Swedana", time: "2:00 PM", date: todayISO, status: "confirmed" },
      { patient: "Arjun Kumar", therapy: "Nasya", time: "3:30 PM", date: todayISO, status: "confirmed" }
    ]
  );

  // Patient directory (would come from API in real app)
  const [patients, setPatients] = usePersistentState<string[]>(
    'dashboard.patients',
    [
    'Aarav Sharma','Aditi Nair','Ananya Gupta','Anika Rao','Arjun Kumar','Divya Menon','Ishaan Patel','Kavya Singh','Maya Singh','Neha Verma','Priya Sharma','Raj Patel','Rohan Das','Sanya Khanna','Vikram Joshi'
    ]
  );
  const [patientSearch, setPatientSearch] = useState('');
  const filteredPatients = useMemo(
    () => patients.filter(p => p.toLowerCase().includes(patientSearch.toLowerCase())),
    [patientSearch, patients]
  );

  const therapyOptions = ['Abhyanga','Shirodhara','Swedana','Nasya','Basti'];
  const [newTherapy, setNewTherapy] = useState(therapyOptions[0]);
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState(todayISO);

  // New patient form state (only adds to directory; scheduling happens from Patients sheet)
  const [newPatientName, setNewPatientName] = useState('');
  const canAddNewPatient = newPatientName.trim().length > 2;

  const addToSchedule = (patient: string) => {
    if (!newTime || !newDate) return;
    setSessions(prev => [...prev, { patient, therapy: newTherapy, time: newTime, date: newDate, status: 'pending' }]);
    setNewTime('');
  };

  const handleAddNewPatient = () => {
    if (!canAddNewPatient) return;
    const name = newPatientName.trim().replace(/\s+/g,' ');
    if (!patients.includes(name)) {
      setPatients(prev => [...prev, name].sort((a,b)=>a.localeCompare(b)));
    }
    setNewPatientName('');
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return iso; }
  };

  const recentNotifications = [
    { message: "Pre-procedure notification sent to Priya Sharma", time: "5 min ago", type: "info" },
    { message: "Session completed for Raj Patel", time: "1 hour ago", type: "success" },
    { message: "Feedback received from Maya Singh", time: "2 hours ago", type: "info" }
  ];

  return (  
    <section id="dashboard" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Practitioner Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a comprehensive view of your practice with real-time insights, 
            patient management, and therapy tracking all in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
               <Card className="border-border bg-card dash-reveal fade-up">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">247</div>
                  <p className="text-xs text-success">+12% from last month</p>
                </CardContent>
              </Card>

               <Card className="border-border bg-card dash-reveal fade-up">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Today's Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">18</div>
                  <p className="text-xs text-primary">4 completed</p>
                </CardContent>
              </Card>

               <Card className="border-border bg-card dash-reveal fade-up">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">94.2%</div>
                  <p className="text-xs text-success">+2.1% improvement</p>
                </CardContent>
              </Card>

               <Card className="border-border bg-card dash-reveal fade-up">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">₹84.5K</div>
                  <p className="text-xs text-success">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Schedule */}
            <Card className="border-border bg-card dash-reveal fade-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Schedule</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Manage your therapy sessions and patient appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{session.patient}</p>
                          <p className="text-sm text-muted-foreground">{session.therapy}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{session.time}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                          <div className="flex items-center">
                            {session.status === 'confirmed' ? (
                              <CheckCircle className="h-4 w-4 text-success mr-1" />
                            ) : (
                              <Clock className="h-4 w-4 text-warning mr-1" />
                            )}
                            <span className={`text-xs capitalize ${
                              session.status === 'confirmed' ? 'text-success' : 'text-warning'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Analytics & Insights */}
            <AnalyticsInsights />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-border bg-card dash-reveal fade-up">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-primary justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Patients
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Patients</SheetTitle>
                      <SheetDescription>Select a patient to add to today's schedule.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <div className="flex gap-2 items-center">
                        <Input placeholder="Search patients" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <select className="w-1/3 border rounded-md bg-background px-2 py-1 text-sm" value={newTherapy} onChange={e => setNewTherapy(e.target.value)}>
                          {therapyOptions.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="w-1/3 border rounded-md bg-background px-2 py-1 text-sm"
                        />
                        <input
                          type="time"
                          value={newTime}
                          onChange={e => setNewTime(e.target.value)}
                          className="w-1/3 border rounded-md bg-background px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="max-h-[50vh] overflow-y-auto rounded-md border">
                        {filteredPatients.map(p => {
                          const alreadyScheduled = sessions.some(s => s.patient === p && s.date === newDate);
                          return (
                            <div key={p} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 bg-card/50 hover:bg-muted/50">
                              <div className="text-sm font-medium text-foreground">{p}</div>
                              <Button
                                size="sm"
                                variant={alreadyScheduled ? 'ghost' : 'outline'}
                                disabled={alreadyScheduled || !newTime || !newDate}
                                onClick={() => addToSchedule(p)}
                              >
                                {alreadyScheduled ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          );
                        })}
                        {filteredPatients.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground text-center">No patients found.</div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Select therapy & time, then click Add beside a patient.</p>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
                {/* Add Patient Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      New Patient
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Add New Patient</SheetTitle>
                      <SheetDescription>Add patient to directory. Then open Patients panel to schedule.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                        <Input
                          placeholder="e.g. Riya Malhotra"
                          value={newPatientName}
                          onChange={e => setNewPatientName(e.target.value)}
                        />
                      </div>
                      <Button disabled={!canAddNewPatient} onClick={handleAddNewPatient} className="w-full bg-gradient-primary">
                        Add Patient
                      </Button>
                      <p className="text-xs text-muted-foreground">After adding, open Patients panel to assign therapy, date & time.</p>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border bg-card dash-reveal fade-up">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotifications.map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-success' : 'bg-primary'
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

            {/* Patient Progress */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Patient Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Priya Sharma</span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Raj Patel</span>
                    <span className="text-muted-foreground">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Maya Singh</span>
                    <span className="text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;