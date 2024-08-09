import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Post = {
    id: number;
    content: string;
    image?: string;
};

export default function PostList({ isAdmin = false }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched posts:', data); // Debug log
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to fetch posts. Please try again.');
            toast({
                title: "Error",
                description: "Failed to fetch posts. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setPosts(posts.filter(post => post.id !== postId));
            toast({
                title: "Success",
                description: "Post deleted successfully!",
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            toast({
                title: "Error",
                description: "Failed to delete post. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <p>No posts available.</p>
            ) : (
                posts.map((post) => (
                    <Card key={post.id}>
                        <CardHeader>
                            <CardTitle>Post #{post.id}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{post.content}</p>
                            {post.image && (
                                <img 
                                    src={post.image} 
                                    alt="Post image" 
                                    className="mt-2 max-w-full h-auto rounded-lg"
                                />
                            )}
                        </CardContent>
                        {isAdmin && (
                            <CardFooter>
                                <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(post.id)}
                                >
                                    Delete
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}