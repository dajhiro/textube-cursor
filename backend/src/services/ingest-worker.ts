import { db } from '../db/client';
import { PostService } from './post-service';
import { SubmissionStatus, SourceType } from '@textube/shared';
import { getAdapter } from '../adapters';

export class IngestWorker {
  private postService: PostService;
  
  constructor() {
    this.postService = new PostService();
  }
  
  /**
   * 제출된 링크 처리
   */
  async processSubmission(submissionId: string): Promise<void> {
    // 제출 정보 가져오기
    const result = await db.query(
      `SELECT * FROM link_submissions WHERE id = $1`,
      [submissionId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Submission not found: ${submissionId}`);
    }
    
    const submission = result.rows[0];
    
    if (submission.status !== SubmissionStatus.PENDING) {
      return; // 이미 처리됨
    }
    
    try {
      // 상태를 처리 중으로 변경
      await db.query(
        `UPDATE link_submissions SET status = $1 WHERE id = $2`,
        [SubmissionStatus.PROCESSING, submissionId]
      );
      
      // 게시글 생성
      const post = await this.postService.createPostFromLink(
        submission.url_normalized,
        submission.source_type as SourceType,
        submission.submitted_by
      );
      
      // 시도자 기록 (최초 작성자가 아니면)
      const authorCheck = await db.query(
        `SELECT author_user_id FROM posts WHERE id = $1`,
        [post.id]
      );
      
      if (authorCheck.rows[0].author_user_id !== submission.submitted_by) {
        await db.query(
          `INSERT INTO post_attempts (post_id, user_id, note)
           VALUES ($1, $2, NULL)
           ON CONFLICT (post_id, user_id) DO NOTHING`,
          [post.id, submission.submitted_by]
        );
      }
      
      // 랭킹 점수 계산
      await this.postService.updateRankScore(post.id);
      
      // 상태를 완료로 변경
      await db.query(
        `UPDATE link_submissions SET status = $1 WHERE id = $2`,
        [SubmissionStatus.COMPLETED, submissionId]
      );
      
      // TODO: 요약/번역 작업 큐에 추가
      
    } catch (error) {
      console.error(`Error processing submission ${submissionId}:`, error);
      
      // 상태를 실패로 변경
      await db.query(
        `UPDATE link_submissions SET status = $1, rejected_reason = $2 WHERE id = $3`,
        [SubmissionStatus.FAILED, error instanceof Error ? error.message : 'Unknown error', submissionId]
      );
      
      throw error;
    }
  }
  
  /**
   * 대기 중인 제출 처리 (크론 작업용)
   */
  async processPendingSubmissions(limit: number = 10): Promise<void> {
    const result = await db.query(
      `SELECT id FROM link_submissions 
       WHERE status = $1 
       ORDER BY created_at ASC 
       LIMIT $2`,
      [SubmissionStatus.PENDING, limit]
    );
    
    for (const row of result.rows) {
      try {
        await this.processSubmission(row.id);
      } catch (error) {
        console.error(`Failed to process submission ${row.id}:`, error);
        // 계속 진행
      }
    }
  }
}

