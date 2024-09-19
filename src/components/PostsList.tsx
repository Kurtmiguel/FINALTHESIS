'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  images?: string[];
  createdAt: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
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
            {post.images && post.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.images.map((image, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover rounded cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      />
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-4xl p-0">
                      <Image
                        src={image}
                        alt={`Full size post image ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
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