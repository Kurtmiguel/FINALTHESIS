'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPost ? 'PUT' : 'POST';
    const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author: 'Barangay Panapaan V' }),
    });

    if (response.ok) {
      setTitle('');
      setContent('');
      setEditingPost(null);
      fetchPosts();
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (response.ok) {
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
        />
        <Button type="submit">{editingPost ? 'Update' : 'Create'} Post</Button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
              <div className="mt-4 flex space-x-2">
                <Button onClick={() => handleEdit(post)}>Edit</Button>
                <Button onClick={() => handleDelete(post._id)} variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}