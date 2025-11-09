import { db } from '../db/client';
import { URLNormalizer } from '../utils/url-normalizer';
import { config } from '../config';
import { SourceType, SubmissionStatus, SubmitLinkRequest, SubmitLinkResponse } from '@textube/shared';
import { v4 as uuidv4 } from 'uuid';
import { IngestWorker } from './ingest-worker';

export class LinkService {
  /**
   * 링크 제출 처리
   */
  async submitLink(userId: string, request: SubmitLinkRequest): Promise<SubmitLinkResponse> {
    const { normalized, sourceType } = URLNormalizer.normalize(request.url);
    
    // 안전성 검사
    const safetyCheck = URLNormalizer.isSafe(normalized, config.allowedDomains);
    if (!safetyCheck.safe) {
      // 제출은 기록하되 거부 상태로
      const submissionId = await this.createSubmission(
        userId,
        request.url,
        normalized,
        sourceType,
        SubmissionStatus.REJECTED,
        safetyCheck.reason
      );
      return {
        submissionId,
        status: SubmissionStatus.REJECTED,
      };
    }
    
    // 기존 게시글 확인
    const existingPost = await this.findPostByUrl(normalized);
    
    if (existingPost) {
      // 이미 존재하는 게시글 - 시도자로 기록
      await this.recordAttempt(existingPost.id, userId, request.note);
      
      // 제출 기록 생성
      const submissionId = await this.createSubmission(
        userId,
        request.url,
        normalized,
        sourceType,
        SubmissionStatus.COMPLETED
      );
      
      return {
        submissionId,
        status: SubmissionStatus.COMPLETED,
        postId: existingPost.id,
      };
    }
    
    // 새 게시글 생성
    const submissionId = await this.createSubmission(
      userId,
      request.url,
      normalized,
      sourceType,
      SubmissionStatus.PENDING
    );
    
    // 비동기 처리 (백그라운드에서 처리)
    // 실제 운영 환경에서는 Redis 큐를 사용하는 것이 좋음
    const ingestWorker = new IngestWorker();
    ingestWorker.processSubmission(submissionId).catch(error => {
      console.error(`Failed to process submission ${submissionId}:`, error);
    });
    
    return {
      submissionId,
      status: SubmissionStatus.PENDING,
    };
  }
  
  private async createSubmission(
    userId: string,
    urlOriginal: string,
    urlNormalized: string,
    sourceType: SourceType,
    status: SubmissionStatus,
    rejectedReason?: string
  ): Promise<string> {
    const id = uuidv4();
    await db.query(
      `INSERT INTO link_submissions (id, submitted_by, url_original, url_normalized, source_type, status, rejected_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, urlOriginal, urlNormalized, sourceType, status, rejectedReason || null]
    );
    return id;
  }
  
  private async findPostByUrl(url: string) {
    const result = await db.query(
      `SELECT id FROM posts WHERE url_canonical = $1 LIMIT 1`,
      [url]
    );
    return result.rows[0] || null;
  }
  
  private async recordAttempt(postId: string, userId: string, note?: string) {
    await db.query(
      `INSERT INTO post_attempts (post_id, user_id, note)
       VALUES ($1, $2, $3)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId, note || null]
    );
  }
}

