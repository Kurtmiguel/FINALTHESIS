// File: components/PostEditForm.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  images?: string[];
  createdAt: string;
}

export default function PostEditForm({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
          setTitle(data.title);
          setContent(data.content);
        } else {
          throw new Error('Failed to fetch post');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    }

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    newImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        router.push('/admin-dashboard/posts');
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
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
      />
      {post.images && post.images.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Current Images:</h3>
          <div className="flex flex-wrap gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
      <Button type="submit">Save Changes</Button>
    </form>
  );
}