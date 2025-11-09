import { db } from '../db/client';
import { getAdapter } from '../adapters';
import { SourceType, Post, PostLink, SourceMetadata } from '@textube/shared';
import { v4 as uuidv4 } from 'uuid';

export class PostService {
  /**
   * 새 게시글 생성 (링크에서 콘텐츠 가져오기)
   */
  async createPostFromLink(
    url: string,
    sourceType: SourceType,
    authorUserId: string | null
  ): Promise<Post> {
    // 어댑터로 콘텐츠 가져오기
    const adapter = getAdapter(sourceType);
    if (!adapter) {
      throw new Error(`No adapter for source type: ${sourceType}`);
    }
    
    const content = await adapter.fetchContent(url);
    const externalId = adapter.extractExternalId(url);
    
    // 게시글 생성
    const postId = uuidv4();
    await db.query(
      `INSERT INTO posts (id, url_canonical, title, author_user_id, view_count, rank_score)
       VALUES ($1, $2, $3, $4, 0, 0)`,
      [postId, url, content.title, authorUserId]
    );
    
    // 링크 변형 기록
    await db.query(
      `INSERT INTO post_links (id, post_id, url_variant, source_type, is_primary)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [uuidv4(), postId, url, sourceType]
    );
    
    // 소스 메타데이터 저장
    if (externalId) {
      await db.query(
        `INSERT INTO source_metadata (id, post_id, source_type, external_id, fetched_payload, engagement_signals)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          uuidv4(),
          postId,
          sourceType,
          externalId,
          JSON.stringify(content.metadata),
          JSON.stringify(content.engagementSignals),
        ]
      );
    }
    
    // 원문을 객체 스토리지에 저장 (TODO: 실제 구현)
    // 임시로 본문을 직접 저장
    await db.query(
      `UPDATE posts SET body_original_ref = $1 WHERE id = $2`,
      [JSON.stringify({ body: content.body }), postId]
    );
    
    const result = await db.query(`SELECT * FROM posts WHERE id = $1`, [postId]);
    return result.rows[0];
  }
  
  /**
   * 랭킹 점수 계산 및 업데이트
   */
  async updateRankScore(postId: string): Promise<void> {
    // 조회수, 시도자 수, 댓글 수, 외부 engagement 등을 기반으로 점수 계산
    const result = await db.query(
      `SELECT 
        p.view_count,
        COUNT(DISTINCT pa.id) as attempt_count,
        COUNT(DISTINCT c.id) as comment_count,
        COALESCE(sm.engagement_signals->>'upvotes', '0')::int as external_upvotes,
        COALESCE(sm.engagement_signals->>'views', '0')::int as external_views,
        EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 as hours_old
      FROM posts p
      LEFT JOIN post_attempts pa ON p.id = pa.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN source_metadata sm ON p.id = sm.post_id
      WHERE p.id = $1
      GROUP BY p.id, p.view_count, p.created_at, sm.engagement_signals`,
      [postId]
    );
    
    if (result.rows.length === 0) {
      return;
    }
    
    const data = result.rows[0];
    const viewCount = parseInt(data.view_count) || 0;
    const attemptCount = parseInt(data.attempt_count) || 0;
    const commentCount = parseInt(data.comment_count) || 0;
    const externalUpvotes = parseInt(data.external_upvotes) || 0;
    const externalViews = parseInt(data.external_views) || 0;
    const hoursOld = parseFloat(data.hours_old) || 1;
    
    // 랭킹 점수 계산 (가중치 기반)
    // 시간 감가: 최근일수록 높은 점수
    const timeDecay = 1 / (1 + hoursOld / 24); // 24시간 기준
    
    const rankScore =
      Math.log(viewCount + 1) * 1.0 + // 조회수 로그
      attemptCount * 2.0 + // 시도자 수
      commentCount * 3.0 + // 댓글 수
      Math.log(externalUpvotes + 1) * 1.5 + // 외부 upvote
      Math.log(externalViews + 1) * 0.5 + // 외부 조회수
      timeDecay * 10.0; // 시간 감가
    
    await db.query(
      `UPDATE posts SET rank_score = $1 WHERE id = $2`,
      [rankScore, postId]
    );
  }
}

