import Header from '@/components/Header';
import DoctorDashboard from '@/components/DoctorDashboard';
import Footer from '@/components/Footer';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorPage = () => {
  const [role] = useUserRole();
  const navigate = useNavigate();
  useEffect(() => { if (role !== 'doctor') navigate('/role'); }, [role, navigate]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SignedIn>
        <DoctorDashboard />
      </SignedIn>
      <SignedOut>
        <div className="py-20 max-w-md mx-auto px-4 animate-in fade-in">
          <h2 className="text-2xl font-bold mb-4 text-center">Doctor Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">Sign in to access the practitioner dashboard.</p>
          <SignIn afterSignInUrl="/doctor" />
        </div>
      </SignedOut>
      <Footer />
    </div>
  );
};

export default DoctorPage;

