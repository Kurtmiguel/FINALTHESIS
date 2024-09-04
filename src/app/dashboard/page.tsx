'use client';

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-semibold text-gray-900">Welcome, {session?.user?.name}!</h2>
      <p className="mt-2 text-gray-600">This is your personal dashboard. Here you can manage your canine registrations and view important information.</p>
      {/* Add more dashboard content here */}
    </div>
  );
}