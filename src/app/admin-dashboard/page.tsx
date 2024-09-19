import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminDashboardStats from '@/components/AdminDashboardStats';
import OwnerList from '@/components/OwnerList';
import { getUsersAndDogs, UserData } from '@/lib/adminUtils';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const { users, dogsWithCollars, dogsWithoutCollars } = await getUsersAndDogs();

  const owners = users.map((user: UserData) => ({
    id: user._id.toString(),
    name: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Welcome, {session?.user?.name || 'Admin'}!</h2>
      
      <AdminDashboardStats
        totalOwners={users.length}
        dogsWithCollars={dogsWithCollars}
        dogsWithoutCollars={dogsWithoutCollars}
      />
      
      <OwnerList owners={owners} />
    </div>
  );
}