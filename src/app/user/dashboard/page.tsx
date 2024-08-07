"use client"

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import Image from "next/image";
import { useState } from "react";
import Sidebar from '@/components/UserSidebar'; // Ensure the Sidebar component is correctly imported

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-950 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/brgylogo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
              priority
            />
            <span className="text-2xl font-bold">Barangay Canine Management System</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-200">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Welcome to System</h2>
            {/* Admin posts would go here */}
            <p>No admin posts available.</p>
          </div>
        </main>

        {/* User Profile */}
        <aside className="w-64 bg-white p-4 flex flex-col items-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="mt-4 text-center">
            <p className="font-semibold">Name: John Doe</p>
            <p className="text-sm text-gray-500">Email: john@example.com</p>
            <p className="text-sm text-gray-500">Contact: 123-456-7890</p>
            <p className="text-sm text-gray-500">Address: 123 Main St</p>
          </div>
        </aside>
      </div>

      <footer className="bg-blue-950 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
      </footer>
    </div>
  );
}
