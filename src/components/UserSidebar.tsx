"use client"

import { Button } from "@/components/ui/button";
import { Home, FileText, LogOut } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <div className="w-64 bg-blue-900 text-white h-screen p-4">
      <nav className="space-y-4">
        <Button 
          variant={activeTab === 'home' ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => setActiveTab('home')}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button 
          variant={activeTab === 'DogReg' ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => setActiveTab('DogReg')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Dog Register
        </Button>
        <Button 
          variant={activeTab === 'monitoring' ? "secondary" : "ghost"} 
          className="w-full justify-start" 
          onClick={() => setActiveTab('monitoring')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Monitoring
        </Button>
        <Button variant="destructive" className="w-full justify-start mt-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </nav>
    </div>
  );
}
