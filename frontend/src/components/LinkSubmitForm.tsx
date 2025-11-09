'use client';

import { useState } from 'react';
import axios from 'axios';

export default function LinkSubmitForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/links/submit', {
        url,
      }, {
        headers: {
          'x-user-id': 'temp-user-id', // TODO: 실제 인증 토큰 사용
        },
      });

      if (response.data.status === 'pending') {
        setMessage('링크가 제출되었습니다. 처리 중...');
      } else if (response.data.status === 'completed') {
        setMessage('링크가 이미 존재합니다.');
      } else {
        setMessage(`제출 실패: ${response.data.status}`);
      }

      setUrl('');
    } catch (error: any) {
      setMessage(`오류: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '1rem' }}>링크 제출</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube, Reddit, StackOverflow 링크를 입력하세요"
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            fontSize: '1rem',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '제출 중...' : '제출'}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: '1rem', color: message.includes('오류') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}

