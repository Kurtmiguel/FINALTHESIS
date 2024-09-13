import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import PostList from '@/components/PostsList';


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-6">Welcome, {session?.user?.name || 'User'}!</h2>
      <h3 className="text-xl font-semibold mb-4">Recent Announcements</h3>
      <PostList />
    </div>
  );
}