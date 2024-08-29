"use client";

import { useState } from 'react';
import UserSidebar from '@/components/UserSidebar';
import PostList from '@/components/PostList';

export default function UserDashboard() {
const [activeTab, setActiveTab] = useState('home');

return (
<div className="flex">
<UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
<main className="flex-1 p-6">
{activeTab === 'home' && <PostList />}
{activeTab === 'DogReg' && <p>Dog Registration Component</p>}
{activeTab === 'monitoring' && <p>Monitoring Component</p>}
</main>
</div>
);
}