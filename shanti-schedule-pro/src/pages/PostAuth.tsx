import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';

// Decides where to go immediately after authentication
const PostAuth = () => {
  const [role] = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'doctor') navigate('/doctor', { replace: true });
    else if (role === 'patient') navigate('/patient', { replace: true });
    else navigate('/role', { replace: true });
  }, [role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Redirecting...
      <SignedOut>
        <div className="mt-6"><SignIn routing="path" path="/sign-in" afterSignInUrl="/post-auth" /></div>
      </SignedOut>
    </div>
  );
};

export default PostAuth;
