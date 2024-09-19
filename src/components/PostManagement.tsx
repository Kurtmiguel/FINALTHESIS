'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      setError('Failed to fetch posts. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', 'Barangay Panapaan V');

    images.forEach((image) => {
      formData.append('images', image);
    });

    if (editingPost) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    const method = editingPost ? 'PUT' : 'POST';
    const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setImages([]);
        setEditingPost(null);
        setImagesToDelete([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPosts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingPost ? 'update' : 'create'} post`);
      }
    } catch (error) {
      console.error(`Error ${editingPost ? 'updating' : 'creating'} post:`, error);
      setError(`Failed to ${editingPost ? 'update' : 'create'} post. Please try again.`);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImages([]);
    setImagesToDelete([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImages([]);
    setImagesToDelete([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, { 
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPosts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prevImages => [...prevImages, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const handleUndoRemoveExistingImage = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`New image ${index + 1}`}
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                  size="sm"
                >
                  X
                </Button>
              </div>
            ))}
          </div>
        )}
        {editingPost && editingPost.images && (
          <div className="flex flex-wrap gap-2">
            {editingPost.images.map((imageUrl, index) => (
              <div key={index} className="relative">
                <Image
                  src={imageUrl}
                  alt={`Existing image ${index + 1}`}
                  width={100}
                  height={100}
                  className={`object-cover rounded ${imagesToDelete.includes(imageUrl) ? 'opacity-50' : ''}`}
                />
                <Button
                  type="button"
                  onClick={() => imagesToDelete.includes(imageUrl) 
                    ? handleUndoRemoveExistingImage(imageUrl)
                    : handleRemoveExistingImage(imageUrl)}
                  className={`absolute top-0 right-0 p-1 ${imagesToDelete.includes(imageUrl) ? 'bg-green-500' : 'bg-red-500'} text-white rounded-full`}
                  size="sm"
                >
                  {imagesToDelete.includes(imageUrl) ? 'Undo' : 'X'}
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <Button type="submit">{editingPost ? 'Update' : 'Create'} Post</Button>
          {editingPost && (
            <Button type="button" onClick={handleCancelEdit} variant="outline">
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
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