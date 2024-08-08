import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Post = {
    id: number;
    content: string;
    image?: string;
};

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                    console.log('Fetched posts:', data);
                } else {
                    console.error('Failed to fetch posts:', await response.json());
                    throw new Error('Failed to fetch posts');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="space-y-4">
            {posts.map((post) => (
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
                </Card>
            ))}
        </div>
    );
}
