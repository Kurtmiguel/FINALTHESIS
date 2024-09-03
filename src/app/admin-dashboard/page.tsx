import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome, Admin {session.user.name}!</h2>
            <p className="mt-2 text-gray-600">This is the admin dashboard. Here you can manage users, view statistics, and perform administrative tasks.</p>
            {/* Add more admin dashboard content here */}
          </div>
        </div>
      </main>
    </div>
  );
}