import React from 'react';
import PostManagement from '@/components/PostManagement';

export default function AdminPostsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Posts</h1>
      <PostManagement />
    </div>
  );
}