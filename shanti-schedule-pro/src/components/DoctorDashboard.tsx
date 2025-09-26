import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import {
  Users, Calendar, Activity, TrendingUp, Clock, CheckCircle, XCircle, Plus,
  Filter, MoreHorizontal, Search, Edit, Check, X, ListChecks, Bell
} from 'lucide-react';

type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
interface Session {
  id: string;
  patient: string;
  therapy: string;
  time: string; // HH:MM (24h) or with AM/PM; stored as entered
  date: string; // yyyy-mm-dd
  status: SessionStatus;
  notes?: string;
}

// Mirror of patient appointment requests saved by PatientSchedule
interface PatientAppointment {
  id: string;
  name: string;
  therapy: string;
  date: string;
  time: string;
  createdAt: string;
}

const therapyOptions = ['Abhyanga','Shirodhara','Swedana','Nasya','Basti'];

const statusOrder: SessionStatus[] = ['pending','confirmed','completed','cancelled'];

const DoctorDashboard = () => {
  // On-view animations reuse existing fade-up classes
  useEffect(() => {
    const els = document.querySelectorAll('.doc-reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
        else e.target.classList.remove('visible');
      });
    }, { threshold: 0.2 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const todayISO = useMemo(() => new Date().toISOString().slice(0,10), []);

  const [sessions, setSessions] = usePersistentState<Session[]>(
    'doctor.sessions',
    [
      { id: crypto.randomUUID(), patient: 'Priya Sharma', therapy: 'Abhyanga', time: '10:00', date: todayISO, status: 'confirmed' },
      { id: crypto.randomUUID(), patient: 'Raj Patel', therapy: 'Shirodhara', time: '11:30', date: todayISO, status: 'pending' },
      { id: crypto.randomUUID(), patient: 'Maya Singh', therapy: 'Swedana', time: '14:00', date: todayISO, status: 'confirmed' },
      { id: crypto.randomUUID(), patient: 'Arjun Kumar', therapy: 'Nasya', time: '15:30', date: todayISO, status: 'completed' }
    ]
  );
  const [patients, setPatients] = usePersistentState<string[]>(
    'doctor.patients',
    ['Priya Sharma','Raj Patel','Maya Singh','Arjun Kumar','Aarav Sharma','Anika Rao','Neha Verma','Rohan Das']
  );
  // Read patient appointment requests from localStorage
  const [incomingRequests, setIncomingRequests] = usePersistentState<PatientAppointment[]>(
    'patient.appointments',
    []
  );
  // Live patient name typing from patient page
  const [liveName, setLiveName] = useState<string>('');
  const bcRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'doctor.livePatientName') {
        try { const v = e.newValue ? JSON.parse(e.newValue) : null; setLiveName(v?.name || ''); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    // Initialize from current localStorage
    try {
      const val = localStorage.getItem('doctor.livePatientName');
      if (val) { const v = JSON.parse(val); setLiveName(v?.name || ''); }
    } catch {}
    // Setup BroadcastChannel
    if ('BroadcastChannel' in window) {
      bcRef.current = new BroadcastChannel('doctor-live');
      bcRef.current.onmessage = (ev) => {
        const data = ev.data as { name?: string } | undefined;
        if (data && typeof data.name === 'string') setLiveName(data.name);
      };
    }
    return () => {
      window.removeEventListener('storage', onStorage);
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, []);
  // Selected patients (for focused workflow)
  const [selectedPatients, setSelectedPatients] = usePersistentState<string[]>(
    'doctor.selectedPatients',
    []
  );

  // Filters & search
  const [dateFilter, setDateFilter] = useState<string>(todayISO);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const visibleSessions = useMemo(() => {
    return sessions
      .filter(s => !dateFilter || s.date === dateFilter)
      .filter(s => statusFilter === 'all' || s.status === statusFilter)
      .filter(s => !search || s.patient.toLowerCase().includes(search.toLowerCase()))
      .filter(s => selectedPatients.length === 0 || selectedPatients.includes(s.patient))
      .sort((a,b) => (a.time.localeCompare(b.time)));
  }, [sessions, dateFilter, statusFilter, search, selectedPatients]);

  // New session creation
  const [newPatient, setNewPatient] = useState('');
  const [newTherapy, setNewTherapy] = useState(therapyOptions[0]);
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState(todayISO);
  const canAddSession = newPatient.trim().length > 2 && newTime && newDate;
  // Patient picker inside the New Session sheet
  const [patientPickerQuery, setPatientPickerQuery] = useState('');

  const addSession = () => {
    if (!canAddSession) return;
    const patientName = newPatient.trim();
    setSessions(prev => [...prev, { id: crypto.randomUUID(), patient: patientName, therapy: newTherapy, time: newTime, date: newDate, status: 'pending' }]);
    if (!patients.includes(patientName)) setPatients(p => [...p, patientName].sort((a,b)=>a.localeCompare(b)));
    setNewPatient('');
    setNewTime('');
  };

  const cycleStatus = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: statusOrder[(statusOrder.indexOf(s.status)+1) % statusOrder.length] } : s));
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return iso; }
  };

  // Metrics
  const todaySessions = sessions.filter(s => s.date === todayISO);
  const confirmedToday = todaySessions.filter(s => s.status === 'confirmed').length;
  const completedToday = todaySessions.filter(s => s.status === 'completed').length;
  const completionRate = todaySessions.length ? Math.round((completedToday / todaySessions.length) * 100) : 0;

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Doctor Dashboard</h2>
            <p className="text-muted-foreground text-sm max-w-xl">Manage your daily schedule, monitor patient progress and streamline therapy planning.</p>
            {liveName && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-foreground">Patient typing: <strong>{liveName}</strong></span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => {
                  const n = liveName.trim();
                  if (!n) return;
                  if (!patients.includes(n)) setPatients(p => [...p, n].sort((a,b)=>a.localeCompare(b)));
                }}>Add to Directory</Button>
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="border rounded-md bg-background px-2 py-1 text-sm"/>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="border rounded-md bg-background px-2 py-1 text-sm">
                <option value="all">All Status</option>
                {statusOrder.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground"/>
              <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient" className="pl-8 h-9 w-48" />
            </div>
            {selectedPatients.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/40 text-xs">
                <span className="text-foreground">Selected: {selectedPatients.length}</span>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={()=>setSelectedPatients([])}>Clear</Button>
              </div>
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <Card className="bg-card border-border doc-reveal fade-up">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center text-muted-foreground"><Users className="h-4 w-4 mr-2"/>Active Patients</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{patients.length}</div><p className="text-xs text-success">directory</p></CardContent>
          </Card>
          <Card className="bg-card border-border doc-reveal fade-up">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center text-muted-foreground"><Calendar className="h-4 w-4 mr-2"/>Today</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{todaySessions.length}</div><p className="text-xs text-primary">{confirmedToday} confirmed</p></CardContent>
          </Card>
            <Card className="bg-card border-border doc-reveal fade-up">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center text-muted-foreground"><Activity className="h-4 w-4 mr-2"/>Completion</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{completionRate}%</div><p className="text-xs text-success">{completedToday} done</p></CardContent>
          </Card>
          <Card className="bg-card border-border doc-reveal fade-up">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center text-muted-foreground"><TrendingUp className="h-4 w-4 mr-2"/>Utilization</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{Math.min(100, todaySessions.length*8)}%</div><p className="text-xs text-muted-foreground">mock metric</p></CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Schedule & sessions */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border bg-card doc-reveal fade-up">
              <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Schedule ({formatDate(dateFilter)})</CardTitle>
                  <CardDescription>Manage and update therapy sessions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1"/>Add Session</Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>New Session</SheetTitle>
                        <SheetDescription>Create and schedule a therapy session.</SheetDescription>
                      </SheetHeader>
                      <div className="mt-4 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Patient Name</label>
                          <Input value={newPatient} onChange={e=>setNewPatient(e.target.value)} placeholder="e.g. Riya Malhotra" />
                        </div>
                        {/* Quick select from directory */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Pick from Directory</span>
                            <Input
                              value={patientPickerQuery}
                              onChange={e=>setPatientPickerQuery(e.target.value)}
                              placeholder="Search"
                              className="h-8 w-40 text-xs"
                            />
                          </div>
                          {selectedPatients.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedPatients.slice(0,8).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setNewPatient(p)}
                                  className="px-2 py-1 rounded-md bg-muted/50 text-xs hover:bg-muted/70"
                                  title="Use this patient"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 divide-y">
                            {patients
                              .filter(p => !patientPickerQuery || p.toLowerCase().includes(patientPickerQuery.toLowerCase()))
                              .sort((a,b)=>a.localeCompare(b))
                              .slice(0,40)
                              .map(p => (
                                <div key={p} className="flex items-center justify-between px-2 py-1 bg-card/50 hover:bg-muted/40">
                                  <span className="truncate text-sm text-foreground pr-2">{p}</span>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setNewPatient(p)}>Use</Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { if (!selectedPatients.includes(p)) setSelectedPatients(prev=>[...prev, p]); }}>Select</Button>
                                  </div>
                                </div>
                              ))}
                            {patients.filter(p => !patientPickerQuery || p.toLowerCase().includes(patientPickerQuery.toLowerCase())).length === 0 && (
                              <div className="px-2 py-3 text-xs text-muted-foreground">No matches in directory.</div>
                            )}
                          </div>
                        </div>
                        {/* Incoming Appointment Requests */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Incoming Requests</span>
                            <span className="text-[11px] text-muted-foreground">Last {Math.min(10, incomingRequests.length)} shown</span>
                          </div>
                          <div className="max-h-44 overflow-y-auto rounded-md border border-border/60 divide-y">
                            {incomingRequests.length === 0 && (
                              <div className="px-2 py-3 text-xs text-muted-foreground">No requests yet.</div>
                            )}
                            {[...incomingRequests]
                              .sort((a,b)=> (b.createdAt || '').localeCompare(a.createdAt || ''))
                              .slice(0,10)
                              .map(req => (
                                <div key={req.id} className="flex items-center justify-between px-2 py-2 bg-card/50 hover:bg-muted/40">
                                  <div className="min-w-0 pr-2">
                                    <p className="text-sm font-medium text-foreground truncate">{req.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{req.therapy} • {req.date} {req.time}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                      onClick={() => {
                                        setNewPatient(req.name);
                                        setNewTherapy(req.therapy);
                                        setNewDate(req.date);
                                        setNewTime(req.time);
                                      }}
                                    >Use</Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select value={newTherapy} onChange={e=>setNewTherapy(e.target.value)} className="flex-1 border rounded-md bg-background px-2 py-2 text-sm">
                            {therapyOptions.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} className="flex-1 border rounded-md bg-background px-2 py-2 text-sm" />
                          <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} className="flex-1 border rounded-md bg-background px-2 py-2 text-sm" />
                        </div>
                        <Button disabled={!canAddSession} onClick={addSession} className="w-full bg-gradient-primary">Add Session</Button>
                        <p className="text-[11px] text-muted-foreground">Patient will be added to directory automatically if new.</p>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="text-left font-medium px-3 py-2 w-32">Time</th>
                        <th className="text-left font-medium px-3 py-2">Patient</th>
                        <th className="text-left font-medium px-3 py-2">Therapy</th>
                        <th className="text-left font-medium px-3 py-2 w-32">Status</th>
                        <th className="px-3 py-2 w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSessions.map(s => (
                        <tr key={s.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium text-foreground">{s.time}</td>
                          <td className="px-3 py-2">{s.patient}</td>
                          <td className="px-3 py-2">{s.therapy}</td>
                          <td className="px-3 py-2">
                            <button onClick={() => cycleStatus(s.id)} className={`text-xs font-medium rounded-full px-2 py-1 capitalize transition-colors
                              ${s.status === 'confirmed' ? 'bg-primary/15 text-primary' : ''}
                              ${s.status === 'pending' ? 'bg-warning/20 text-warning' : ''}
                              ${s.status === 'completed' ? 'bg-success/20 text-success' : ''}
                              ${s.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : ''}
                            `}>{s.status}</button>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cycleStatus(s.id)} title="Next status"><ListChecks className="h-3.5 w-3.5"/></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeSession(s.id)} title="Delete"><X className="h-3.5 w-3.5"/></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleSessions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No sessions match filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Patient Progress Snapshot */}
            <Card className="border-border bg-card doc-reveal fade-up">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center"><Activity className="h-5 w-5 mr-2"/>Patient Progress Snapshot</CardTitle>
                <CardDescription>Manual mock metrics for illustration</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {patients.slice(0,6).map(p => (
                  <div key={p} className="p-3 rounded-lg bg-muted/40">
                    <p className="text-xs font-medium truncate text-foreground mb-1">{p}</p>
                    <Progress value={50 + (p.charCodeAt(0) % 40)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-8">
            <Card className="border-border bg-card doc-reveal fade-up">
              <CardHeader><CardTitle className="text-foreground flex items-center"><Bell className="h-4 w-4 mr-2"/>Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"/>
                  <div className="flex-1">
                    <p className="text-foreground">Pre-session reminder sent to Priya Sharma</p>
                    <p className="text-xs text-muted-foreground">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2"/>
                  <div className="flex-1">
                    <p className="text-foreground">Session completed for Arjun Kumar</p>
                    <p className="text-xs text-muted-foreground">30 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2"/>
                  <div className="flex-1">
                    <p className="text-foreground">Feedback pending from Raj Patel</p>
                    <p className="text-xs text-muted-foreground">1 hr ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card doc-reveal fade-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Directory</CardTitle>
                    <CardDescription>{patients.length} patients</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8" onClick={()=>setSelectedPatients(patients.slice())}>Select All</Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={()=>setSelectedPatients([])}>Clear</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[340px] overflow-y-auto space-y-1 text-sm">
                {patients.sort((a,b)=>a.localeCompare(b)).map(p => {
                  const checked = selectedPatients.includes(p);
                  return (
                    <label key={p} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/40 gap-2 cursor-pointer">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-current"
                          checked={checked}
                          onChange={(e)=>{
                            setSelectedPatients(prev => e.target.checked ? [...new Set([...prev, p])] : prev.filter(x=>x!==p));
                          }}
                        />
                        <span className="truncate text-foreground">{p}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2" onClick={(ev) => { ev.preventDefault(); setNewPatient(p); setNewDate(todayISO); }}>Schedule</Button>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorDashboard;
