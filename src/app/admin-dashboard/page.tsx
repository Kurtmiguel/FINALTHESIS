import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-6">Welcome, {session?.user?.name || 'Admin'}!</h2>
      {/* Main content area intentionally left blank */}
    </div>
  );
}