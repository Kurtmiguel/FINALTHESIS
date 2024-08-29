"use client";
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/AdminSidebar';
import PostForm from '@/components/PostForm';
import RecordMonitoring from '@/components/RecordMonitoring';
import PostList from '@/components/PostList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
        <Header/>
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
        <Footer/>
      </div>
    </ProtectedRoute>
  );
}
