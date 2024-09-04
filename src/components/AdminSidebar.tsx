'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, FolderIcon, LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { icon: HomeIcon, label: 'Home', href: '/admin-dashboard' },
  { icon: FolderIcon, label: 'Records', href: '/admin-dashboard/records' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200">
      <nav className="mt-8 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-150 ease-in-out ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="w-full flex items-center px-4 py-3 mt-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors duration-150 ease-in-out"
        >
          <LogOutIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  );
}