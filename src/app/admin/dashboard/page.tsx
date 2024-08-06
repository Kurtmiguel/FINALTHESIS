"use client"
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import PostForm from '@/components/PostForm'
import RecordMonitoring from '@/components/RecordMonitoring'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard - Barangay Canine Management System</title>
      </Head>

      <header className="bg-blue-950 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/brgylogo.png"  
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
              priority={true}
            />
            <span className="text-2xl font-bold">Barangay Canine Management System</span>
          </Link>
        </div>
      </header>

      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          {activeTab === 'home' && <PostForm />}
          {activeTab === 'record' && <RecordMonitoring />}
        </main>
      </div>
      <footer className="bg-blue-950 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
      </footer>
    </div>
  )
}