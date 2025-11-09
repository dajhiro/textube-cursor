'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  url_canonical: string;
  view_count: number;
  rank_score: number;
  created_at: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/posts?limit=20');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (posts.length === 0) {
    return <div>게시글이 없습니다.</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
          }}
        >
          <h3>
            <a
              href={`/posts/${post.id}`}
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              {post.title}
            </a>
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <a href={post.url_canonical} target="_blank" rel="noopener noreferrer">
              {post.url_canonical}
            </a>
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>
            조회수: {post.view_count} | 점수: {post.rank_score.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

