import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-lg">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}