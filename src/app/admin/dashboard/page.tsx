"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import RecordMonitoring from '@/components/RecordMonitoring';

export default function AdminDashboard() {
const [activeTab, setActiveTab] = useState('home');

const handlePostSubmit = async (post: { content: string; image?: string }) => {
// Implement post submission logic
};

return (
<div className="flex">
<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
<main className="flex-1 p-6">
{activeTab === 'home' && (
<>
<PostForm onSubmit={handlePostSubmit} />
<PostList isAdmin={true} />
</>
)}
{activeTab === 'record' && <RecordMonitoring />}
</main>
</div>
);
}