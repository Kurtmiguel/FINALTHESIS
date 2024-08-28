"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import Image from "next/image";
import { useState } from "react";
import Sidebar from '@/components/UserSidebar';
import PostList from '@/components/PostList'
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 bg-gray-200">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Welcome to System</h2>
            <PostList isAdmin={false} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
