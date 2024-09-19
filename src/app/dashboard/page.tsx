import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import PostList from '@/components/PostsList';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Welcome back, {session?.user?.name || 'User'}!</p>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Announcements</h2>
            <PostList />
          </div>
        </div>
      </div>
    </div>
  );
}