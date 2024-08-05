import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">User Registration</h1>
      <RegisterForm />
    </div>
  );
}