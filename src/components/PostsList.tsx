'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // You might want to set an error state here and display it to the user
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post._id}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}</p>
            {post.content.length > 100 && (
              <Button variant="link" className="p-0 mt-2">See more</Button>
            )}
            <div className="mt-4 text-sm text-gray-500">
              Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}