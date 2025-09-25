import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, User } from 'lucide-react';

const RoleSelect = () => {
  const [role, setRole] = useUserRole();
  const navigate = useNavigate();

  const choose = (r: 'doctor' | 'patient') => {
    setRole(r);
    if (r === 'doctor') navigate('/doctor');
    else navigate('/patient');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 text-center">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Activity className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold">PanchaCare</h1>
          <p className="text-sm text-muted-foreground">Management Software</p>
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">Who are you?</h2>
      <p className="text-muted-foreground max-w-md mb-10">Select your role to continue. Doctors get full dashboard access. Patients can quickly schedule an appointment.</p>
      <div className="grid gap-6 w-full max-w-2xl md:grid-cols-2">
        <div className={`p-6 rounded-2xl border bg-card shadow-soft flex flex-col items-center ${role==='doctor'?'border-primary':'border-border'}`}> 
          <Stethoscope className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Doctor</h3>
          <p className="text-sm text-muted-foreground mb-6">Access practice dashboard, patients, analytics & scheduling.</p>
          <Button onClick={() => choose('doctor')} className="w-full bg-gradient-primary">I'm a Doctor</Button>
        </div>
        <div className={`p-6 rounded-2xl border bg-card shadow-soft flex flex-col items-center ${role==='patient'?'border-primary':'border-border'}`}> 
          <User className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Patient</h3>
          <p className="text-sm text-muted-foreground mb-6">Schedule your therapy appointment without creating an account.</p>
          <Button variant="outline" onClick={() => choose('patient')} className="w-full">I'm a Patient</Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
