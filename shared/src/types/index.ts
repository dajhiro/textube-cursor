/**
 * 공통 타입 정의
 */

export enum SourceType {
  YOUTUBE = 'youtube',
  REDDIT = 'reddit',
  STACKOVERFLOW = 'stackoverflow',
  WEB = 'web',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

export enum ModerationReason {
  SPAM = 'spam',
  UNSAFE = 'unsafe',
  SELF_PROMO = 'self_promo',
  NSFW = 'nsfw',
  MALWARE = 'malware',
  LOW_QUALITY = 'low_quality',
}

export enum ModerationStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkSubmission {
  id: string;
  submittedBy: string; // user_id
  urlOriginal: string;
  urlNormalized: string;
  sourceType: SourceType;
  status: SubmissionStatus;
  rejectedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  urlCanonical: string;
  title: string;
  bodyOriginalRef: string | null; // 객체 스토리지 키
  bodyKoSummary: string | null;
  bodyEnSummary: string | null;
  bodyKoTranslation: string | null;
  bodyEnTranslation: string | null;
  authorUserId: string | null; // 최초 작성자 (익명 가능)
  viewCount: number;
  rankScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostLink {
  id: string;
  postId: string;
  urlVariant: string;
  sourceType: SourceType;
  isPrimary: boolean;
  createdAt: Date;
}

export interface PostAttempt {
  id: string;
  postId: string;
  userId: string;
  note: string | null;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  body: string;
  lang: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceMetadata {
  id: string;
  postId: string;
  sourceType: SourceType;
  externalId: string; // YouTube videoId, Reddit id, etc.
  fetchedPayload: Record<string, any>; // JSONB
  engagementSignals: {
    likes?: number;
    upvotes?: number;
    views?: number;
    comments?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationFlag {
  id: string;
  targetType: 'post' | 'comment' | 'submission';
  targetId: string;
  reason: ModerationReason;
  status: ModerationStatus;
  createdBy: string | null; // user_id (null이면 자동 감지)
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface TaxonomyClassification {
  id: string;
  postId: string;
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  tags: string[];
  language: 'ko' | 'en' | 'mixed' | null;
  qualityScore: number; // 0-1
  createdAt: Date;
  updatedAt: Date;
}

// API 요청/응답 타입
export interface SubmitLinkRequest {
  url: string;
  note?: string;
}

export interface SubmitLinkResponse {
  submissionId: string;
  status: SubmissionStatus;
  postId?: string; // 이미 존재하는 경우
}

export interface GetPostResponse {
  post: Post;
  links: PostLink[];
  attempts: PostAttempt[];
  comments: Comment[];
  sourceMetadata: SourceMetadata | null;
  classification: TaxonomyClassification | null;
}

