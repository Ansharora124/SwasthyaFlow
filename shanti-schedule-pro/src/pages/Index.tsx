import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Dashboard from '@/components/Dashboard';
import PatientPortal from '@/components/PatientPortal';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Dashboard />
      <PatientPortal />
      <Footer />
    </div>
  );
};

export default Index;
