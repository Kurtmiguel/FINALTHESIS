import React from 'react';

interface StatsProps {
  totalOwners: number;
  dogsWithCollars: number;
  dogsWithoutCollars: number;
}

const AdminDashboardStats: React.FC<StatsProps> = ({ totalOwners, dogsWithCollars, dogsWithoutCollars }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Total Registered Owners</h3>
        <p className="text-4xl font-bold text-blue-600">{totalOwners}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Dogs with Smart Collars</h3>
        <p className="text-4xl font-bold text-green-600">{dogsWithCollars}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Dogs without Smart Collars</h3>
        <p className="text-4xl font-bold text-red-600">{dogsWithoutCollars}</p>
      </div>
    </div>
  );
};

export default AdminDashboardStats;