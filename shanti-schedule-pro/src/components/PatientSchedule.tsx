import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Activity, Calendar, Clock, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  name: string;
  therapy: string;
  date: string;
  time: string;
  createdAt: string;
}

const therapyOptions = ['Abhyanga','Shirodhara','Swedana','Nasya','Basti'];

const PatientSchedule = () => {
  const todayISO = new Date().toISOString().slice(0,10);
  const [appointments, setAppointments] = usePersistentState<Appointment[]>('patient.appointments', []);
  const [name, setName] = useState('');
  const [therapy, setTherapy] = useState(therapyOptions[0]);
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('');
  const [submittedId, setSubmittedId] = useState<string|null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const canSubmit = name.trim().length > 2 && time && date;

  // Setup BroadcastChannel for realtime updates (fallback to storage events)
  useEffect(() => {
    if ('BroadcastChannel' in window) {
      bcRef.current = new BroadcastChannel('doctor-live');
    }
    return () => {
      bcRef.current?.close();
      bcRef.current = null;
      // Clear live name when leaving or if field is empty
      try { localStorage.removeItem('doctor.livePatientName'); } catch {}
    };
  }, []);

  // Broadcast the patient's typed name in real time
  useEffect(() => {
    const payload = { name: name.trim(), at: Date.now() };
    try {
      if (payload.name) {
        localStorage.setItem('doctor.livePatientName', JSON.stringify(payload));
      } else {
        localStorage.removeItem('doctor.livePatientName');
      }
    } catch {}
    try {
      bcRef.current?.postMessage(payload);
    } catch {}
  }, [name]);

  const submit = () => {
    if (!canSubmit) return;
    const appt: Appointment = {
      id: crypto.randomUUID(),
      name: name.trim(),
      therapy,
      date,
      time,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, appt]);
    setSubmittedId(appt.id);
    setTime('');
    // Optionally clear the live name after submission
    try {
      localStorage.removeItem('doctor.livePatientName');
      bcRef.current?.postMessage({ name: '', at: Date.now() });
    } catch {}
  };

  const recent = [...appointments].slice(-5).reverse();

  return (
    <section className="py-20 bg-background" id="schedule">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Schedule Appointment</h2>
          <p className="text-muted-foreground">Enter your details to request a therapy session. The clinic will confirm your time.</p>
        </div>
        <Card className="border-border bg-card mb-12">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center"><Calendar className="h-5 w-5 mr-2 text-primary"/>Appointment Form</CardTitle>
            <CardDescription>Provide your information to submit a request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Riya Malhotra"/>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">Therapy</label>
                <select value={therapy} onChange={e=>setTherapy(e.target.value)} className="w-full border rounded-md bg-background px-2 py-2 text-sm">
                  {therapyOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded-md bg-background px-2 py-2 text-sm"/>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">Time</label>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full border rounded-md bg-background px-2 py-2 text-sm"/>
              </div>
            </div>
            <Button disabled={!canSubmit} onClick={submit} className="bg-gradient-primary w-full h-12 text-base">Submit Request</Button>
            {submittedId && (
              <div className="flex items-center text-sm text-success mt-2">
                <CheckCircle className="h-4 w-4 mr-1"/> Appointment submitted! You may close this page.
              </div>
            )}
          </CardContent>
        </Card>
        {appointments.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center"><Activity className="h-5 w-5 mr-2 text-primary"/>Recent Requests</CardTitle>
              <CardDescription>Last 5 submissions (stored locally on this device)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recent.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.therapy}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">{a.date} {a.time}</div>
                </div>
              ))}
              {appointments.length > 5 && <p className="text-[11px] text-muted-foreground">Showing last 5 of {appointments.length}.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default PatientSchedule;
