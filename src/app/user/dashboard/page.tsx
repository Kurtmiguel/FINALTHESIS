"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import Image from "next/image";
import { useState } from "react";
import Sidebar from '@/components/UserSidebar';
import PostList from '@/components/PostList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header/>
        <div className="flex flex-1">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-8 bg-gray-200">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Welcome to System</h2>
              <PostList isAdmin={false} />
            </div>
          </main>
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
        <Footer/>
      </div>
    </ProtectedRoute>
  );
}
