"use client";
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/AdminSidebar';
import PostForm from '@/components/PostForm';
import RecordMonitoring from '@/components/RecordMonitoring';
import PostList from '@/components/PostList';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  const handlePostSubmit = async (post: { content: string; image?: string }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
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
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-6">
            {activeTab === 'home' && (
              <>
                <PostForm onSubmit={handlePostSubmit} />
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
                  <PostList isAdmin={true} />
                </div>
              </>
            )}
            {activeTab === 'record' && <RecordMonitoring />}
          </main>
        </div>
        <footer className="bg-blue-950 text-white p-4 text-center">
          <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
