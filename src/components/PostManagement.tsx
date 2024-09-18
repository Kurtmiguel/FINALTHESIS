'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  images?: string[]; // Make images optional
  createdAt: string;
}

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', 'Barangay Panapaan V');

    images.forEach((image) => {
      formData.append('images', image);
    });

    const method = editingPost ? 'PUT' : 'POST';
    const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';

    if (editingPost) {
      formData.append('id', editingPost._id);
    }

    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (response.ok) {
      setTitle('');
      setContent('');
      setImages([]);
      setEditingPost(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
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
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          ref={fileInputRef}
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
              {post.images && post.images.length > 0 && ( // Add this check
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
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