import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminDashboardStats from '@/components/AdminDashboardStats';
import { getUsersAndDogs, UserData } from '@/lib/adminUtils';
import RecordList from '@/components/RecordList';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const { users, dogs, dogsWithCollars, dogsWithoutCollars } = await getUsersAndDogs();

  const owners: UserData[] = users.map((user: UserData) => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber,
    address: user.address
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
      
      <RecordList owners={owners} dogs={dogs} />
    </div>
  );
}