import { BaseAdapter, FetchedContent } from './base-adapter';
import { SourceType } from '@textube/shared';

export class StackOverflowAdapter extends BaseAdapter {
  sourceType = SourceType.STACKOVERFLOW;
  
  extractExternalId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const match = urlObj.pathname.match(/\/questions\/(\d+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
  
  async fetchContent(url: string): Promise<FetchedContent> {
    const questionId = this.extractExternalId(url);
    if (!questionId) {
      throw new Error('Invalid StackOverflow URL');
    }
    
    // Stack Overflow API 사용
    const apiUrl = `https://api.stackexchange.com/2.3/questions/${questionId}?site=stackoverflow&filter=withbody`;
    
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const question = data.items[0];
        
        // 수락된 답변 또는 최고 점수 답변 가져오기
        let acceptedAnswer = null;
        if (question.accepted_answer_id) {
          const answerUrl = `https://api.stackexchange.com/2.3/answers/${question.accepted_answer_id}?site=stackoverflow&filter=withbody`;
          const answerResponse = await fetch(answerUrl);
          const answerData = await answerResponse.json();
          if (answerData.items && answerData.items.length > 0) {
            acceptedAnswer = answerData.items[0];
          }
        }
        
        return {
          title: question.title,
          body: question.body || '',
          metadata: {
            questionId: question.question_id,
            tags: question.tags,
            viewCount: question.view_count,
            score: question.score,
            answerCount: question.answer_count,
            acceptedAnswerId: question.accepted_answer_id,
            acceptedAnswer: acceptedAnswer ? {
              body: acceptedAnswer.body,
              score: acceptedAnswer.score,
            } : null,
          },
          engagementSignals: {
            views: question.view_count || 0,
            upvotes: question.score || 0,
            comments: question.comment_count || 0,
          },
        };
      }
      
      throw new Error('StackOverflow question not found');
    } catch (error) {
      console.error('Error fetching StackOverflow content:', error);
      throw error;
    }
  }
}

