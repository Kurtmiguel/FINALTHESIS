'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Announcement = {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  image?: string;
};

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          throw new Error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    }

    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <Card key={announcement._id}>
          <CardHeader>
            <CardTitle>{announcement.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{announcement.content.slice(0, 100)}...</p>
            <Button variant="link" className="p-0">See more</Button>
            <div className="mt-4 text-sm text-gray-500">
              Posted by {announcement.author} on {new Date(announcement.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}