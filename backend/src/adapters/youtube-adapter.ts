import { BaseAdapter, FetchedContent } from './base-adapter';
import { SourceType } from '@textube/shared';
import { config } from '../config';

export class YouTubeAdapter extends BaseAdapter {
  sourceType = SourceType.YOUTUBE;
  
  extractExternalId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
        return urlObj.searchParams.get('v');
      }
      
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  async fetchContent(url: string): Promise<FetchedContent> {
    const videoId = this.extractExternalId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // TODO: YouTube Data API v3 사용
    // 현재는 예시 구현
    const apiKey = config.ai.openaiApiKey; // 임시로 API 키 사용
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`;
    
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const snippet = video.snippet;
        const statistics = video.statistics;
        
        return {
          title: snippet.title,
          body: snippet.description || '',
          metadata: {
            channelId: snippet.channelId,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            tags: snippet.tags || [],
            categoryId: snippet.categoryId,
            duration: video.contentDetails?.duration,
          },
          engagementSignals: {
            views: parseInt(statistics.viewCount || '0'),
            likes: parseInt(statistics.likeCount || '0'),
            comments: parseInt(statistics.commentCount || '0'),
          },
        };
      }
      
      throw new Error('Video not found');
    } catch (error) {
      console.error('Error fetching YouTube content:', error);
      throw error;
    }
  }
}

