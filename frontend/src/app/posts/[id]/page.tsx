'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  url_canonical: string;
  body_ko_summary: string | null;
  body_en_summary: string | null;
  body_ko_translation: string | null;
  body_en_translation: string | null;
  view_count: number;
}

interface Comment {
  id: string;
  body: string;
  lang: string;
  created_at: string;
}

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/posts/${postId}`);
      setPost(response.data.post);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <p style={{ marginTop: '1rem' }}>
        <a href={post.url_canonical} target="_blank" rel="noopener noreferrer">
          {post.url_canonical}
        </a>
      </p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>한국어 요약</h2>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '0.5rem' }}>
          {post.body_ko_summary || '요약이 아직 생성되지 않았습니다.'}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>영어 요약</h2>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '0.5rem' }}>
          {post.body_en_summary || '요약이 아직 생성되지 않았습니다.'}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>댓글</h2>
        {comments.length === 0 ? (
          <p>댓글이 없습니다.</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }}
              >
                <p>{comment.body}</p>
                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                  {new Date(comment.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

