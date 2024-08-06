// src/app/admin/dashboard/page.tsx

import Link from 'next/link';
import Image from 'next/image';

const AdminDashboard = () => {
  return (
    <div>
      <header className="bg-blue-950 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/brgylogo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
              priority={true}
            />
            <span className="text-2xl font-bold">Barangay Canine Management System</span>
          </Link>
          <nav>
            {/* Add nav links here */}
          </nav>
        </div>
      </header>
      <div className="flex">
        <aside className="w-1/4 p-4">
          <h2 className="text-xl font-bold">Admin Navigation</h2>
          <nav>
            <ul>
              <li><a href="/admin/dashboard">Home</a></li>
              <li><a href="/admin/records">Records</a></li>
              <li><a href="/admin/monitoring">Monitoring</a></li>
              <li><a href="/admin/account">Account Settings</a></li>
              <li><a href="/logout">Logout</a></li>
            </ul>
          </nav>
        </aside>
        <main className="w-3/4 p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          {/* Dashboard content */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
