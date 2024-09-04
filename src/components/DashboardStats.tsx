'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  ownersRegistered: number;
  dogsWithoutCollars: number;
  dogsWithCollars: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    ownersRegistered: 0,
    dogsWithoutCollars: 0,
    dogsWithCollars: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    
    // Set up an interval to fetch stats every 30 seconds
    const intervalId = setInterval(fetchStats, 30000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Registered Owners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.ownersRegistered}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dogs without Collars</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.dogsWithoutCollars}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dogs with Collars</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.dogsWithCollars}</p>
        </CardContent>
      </Card>
    </div>
  );
}