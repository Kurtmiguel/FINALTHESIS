'use client';

import { useSession } from 'next-auth/react';

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-900">Welcome, Admin {session?.user?.name}!</h2>
      <p className="mt-2 text-gray-600">This is the admin dashboard. Here you can manage users, view statistics, and perform administrative tasks.</p>
      {/* Add more admin dashboard content here */}
    </div>
  );
}