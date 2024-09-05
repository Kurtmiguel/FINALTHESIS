import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminPostForm from '@/components/AdminPostForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold">Welcome, {session?.user?.name}!</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPostForm />
        </CardContent>
      </Card>
    </div>
  );
}