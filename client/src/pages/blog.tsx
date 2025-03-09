import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PixelButton } from '@/components/GameComponents';
import { getQueryFn } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  summary?: string;
  createdAt: string;
}

export default function BlogPage() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  
  const { data: blogPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/blog-posts'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  const { data: selectedPost, isLoading: postLoading } = useQuery({
    queryKey: ['/api/blog-posts', selectedPostId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!selectedPostId,
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Format content for preview (first 150 characters), remove HTML tags if present
  const formatPreview = (content: string) => {
    // Strip HTML tags for preview
    const plainText = content.replace(/<[^>]*>/g, '');
    // Trim whitespace and ensure consistent spacing
    const cleanText = plainText.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length <= 150) return cleanText;
    return cleanText.substring(0, 150) + '...';
  };
  
  // Format content for display with proper HTML
  const formatContent = (content: string) => {
    // If content has HTML tags, render it as HTML
    if (content.includes('<')) {
      return (
        <div dangerouslySetInnerHTML={{ __html: content }} className="blog-content prose prose-invert max-w-none" />
      );
    }
    
    // Fallback to basic paragraph formatting
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-green-500 font-pixel">The Eldritch Chronicle</h1>
        <Link href="/">
          <PixelButton size="md">Back to Game</PixelButton>
        </Link>
      </div>
      
      {selectedPostId ? (
        <div className="mb-8">
          <PixelButton size="sm" onClick={() => setSelectedPostId(null)}>
            ← Back to All Posts
          </PixelButton>
          
          {postLoading ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : selectedPost ? (
            <Card className="mt-4 border-2 border-green-700 bg-black/80">
              <CardHeader>
                <CardTitle className="text-3xl text-green-400">{selectedPost.title}</CardTitle>
                <CardDescription className="text-green-300">
                  By {selectedPost.author} | {formatDate(selectedPost.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-md text-gray-200 leading-relaxed">
                {formatContent(selectedPost.content)}
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 text-red-500">Failed to load blog post</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {postsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-2 border-green-700 bg-black/80">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-1/3" />
                </CardFooter>
              </Card>
            ))
          ) : blogPosts && blogPosts.length > 0 ? (
            blogPosts.map((post: BlogPost) => (
              <Card 
                key={post.id} 
                className="border-2 border-green-700 bg-black/80 hover:border-green-500 transition-all cursor-pointer"
                onClick={() => setSelectedPostId(post.id)}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">{post.title}</CardTitle>
                  <CardDescription className="text-green-200">
                    By {post.author} | {formatDate(post.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  {post.summary || formatPreview(post.content)}
                </CardContent>
                <CardFooter>
                  <PixelButton size="sm">Read More</PixelButton>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-400">No blog posts found</div>
          )}
        </div>
      )}
    </div>
  );
}