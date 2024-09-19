'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';

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
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post._id} className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{post.title}</CardTitle>
            <CardDescription className="flex items-center text-sm text-gray-500 mt-2">
              <User className="w-4 h-4 mr-1" />
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {post.content.length > 150 ? `${post.content.slice(0, 150)}...` : post.content}
            </p>
            {post.content.length > 150 && (
              <Button variant="link" className="p-0 mb-4">Read more</Button>
            )}
            {post.images && post.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.images.map((image, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="relative w-24 h-24 rounded-md overflow-hidden cursor-pointer">
                        <Image
                          src={image}
                          alt={`Post image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          onClick={() => handleImageClick(image)}
                        />
                      </div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}