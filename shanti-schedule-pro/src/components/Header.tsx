import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, Users, Activity } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useActiveSection } from '@/hooks/useActiveSection';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sectionIds = ['features', 'dashboard', 'patients', 'contact'];
  const active = useActiveSection(sectionIds, 80);

  const handleNavClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.history.replaceState(null, '', `#${id}`); // update hash without jump
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [isMenuOpen]);

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PanchaCare</h1>
              <p className="text-xs text-muted-foreground">Management Software</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { id: 'features', label: 'Features' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'patients', label: 'Patient Portal' },
              { id: 'contact', label: 'Contact' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative text-sm font-medium transition-colors focus:outline-none ${active === item.id ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${active === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant="outline">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Button className="bg-gradient-primary">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-in fade-in slide-in-from-top-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {sectionIds.map(id => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`w-full text-left block px-3 py-2 rounded-md transition-colors ${active === id ? 'text-primary bg-muted/50' : 'text-foreground hover:text-primary hover:bg-muted/30'}`}
                >
                  {id === 'patients' ? 'Patient Portal' : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <SignedOut>
                  <SignInButton forceRedirectUrl="/dashboard">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="px-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
                <Button className="bg-gradient-primary" size="sm">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;