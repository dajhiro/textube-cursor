'use client';

import { useState } from 'react';
import LinkSubmitForm from '@/components/LinkSubmitForm';
import PostList from '@/components/PostList';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>TexTube</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <LinkSubmitForm />
      </div>
      
      <div>
        <h2 style={{ marginBottom: '1rem' }}>최근 게시글</h2>
        <PostList />
      </div>
    </main>
  );
}

