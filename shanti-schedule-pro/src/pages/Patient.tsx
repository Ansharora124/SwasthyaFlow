import Header from '@/components/Header';
import PatientSchedule from '@/components/PatientSchedule';
import Footer from '@/components/Footer';

const PatientPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <PatientSchedule />
    <Footer />
  </div>
);

export default PatientPage;

