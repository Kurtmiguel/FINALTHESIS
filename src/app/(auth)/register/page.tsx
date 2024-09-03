import { RegistrationForm } from '@/components/RegistrationForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4">
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  );
}