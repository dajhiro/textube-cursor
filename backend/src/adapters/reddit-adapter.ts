import { BaseAdapter, FetchedContent } from './base-adapter';
import { SourceType } from '@textube/shared';

export class RedditAdapter extends BaseAdapter {
  sourceType = SourceType.REDDIT;
  
  extractExternalId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // /r/subreddit/comments/post_id/title 형태
      const commentsIndex = pathParts.indexOf('comments');
      if (commentsIndex !== -1 && pathParts.length > commentsIndex + 1) {
        return pathParts[commentsIndex + 1];
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  async fetchContent(url: string): Promise<FetchedContent> {
    // Reddit JSON API 사용
    const jsonUrl = url.endsWith('/') ? `${url}.json` : `${url}.json`;
    
    try {
      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'textube-bot/1.0',
        },
      });
      
      const data = await response.json();
      
      if (data && data[0] && data[0].data && data[0].data.children && data[0].data.children.length > 0) {
        const post = data[0].data.children[0].data;
        const comments = data[1]?.data?.children || [];
        
        // 상위 댓글 수집 (예: 상위 5개)
        const topComments = comments
          .slice(0, 5)
          .map((c: any) => c.data)
          .filter((c: any) => c.body && !c.body.includes('[deleted]'))
          .map((c: any) => ({
            author: c.author,
            body: c.body,
            score: c.score,
            created: c.created_utc,
          }));
        
        return {
          title: post.title,
          body: post.selftext || '',
          metadata: {
            subreddit: post.subreddit,
            author: post.author,
            created: post.created_utc,
            permalink: post.permalink,
            url: post.url,
            isSelfPost: post.is_self,
            topComments,
          },
          engagementSignals: {
            upvotes: post.ups || 0,
            comments: post.num_comments || 0,
          },
        };
      }
      
      throw new Error('Reddit post not found');
    } catch (error) {
      console.error('Error fetching Reddit content:', error);
      throw error;
    }
  }
}

