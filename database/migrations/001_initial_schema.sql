-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  trust_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_trust_score ON users(trust_score);

-- 링크 제출 테이블
CREATE TABLE link_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url_original TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_link_submissions_submitted_by ON link_submissions(submitted_by);
CREATE INDEX idx_link_submissions_url_normalized ON link_submissions(url_normalized);
CREATE INDEX idx_link_submissions_status ON link_submissions(status);
CREATE INDEX idx_link_submissions_created_at ON link_submissions(created_at);

-- 게시글 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_canonical TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_original_ref TEXT, -- 객체 스토리지 키
  body_ko_summary TEXT,
  body_en_summary TEXT,
  body_ko_translation TEXT,
  body_en_translation TEXT,
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  rank_score DECIMAL(10,4) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_url_canonical ON posts(url_canonical);
CREATE INDEX idx_posts_author_user_id ON posts(author_user_id);
CREATE INDEX idx_posts_rank_score ON posts(rank_score DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);

-- 게시글 링크 테이블 (동일 링크의 변형들)
CREATE TABLE post_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url_variant TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_links_post_id ON post_links(post_id);
CREATE INDEX idx_post_links_url_variant ON post_links(url_variant);
CREATE UNIQUE INDEX idx_post_links_post_url ON post_links(post_id, url_variant);

-- 게시글 작성 시도자 테이블
CREATE TABLE post_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_attempts_post_id ON post_attempts(post_id);
CREATE INDEX idx_post_attempts_user_id ON post_attempts(user_id);
CREATE UNIQUE INDEX idx_post_attempts_post_user ON post_attempts(post_id, user_id);

-- 댓글 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  lang VARCHAR(10) NOT NULL DEFAULT 'ko',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 소스 메타데이터 테이블
CREATE TABLE source_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  fetched_payload JSONB NOT NULL,
  engagement_signals JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_source_metadata_post_id ON source_metadata(post_id);
CREATE INDEX idx_source_metadata_external_id ON source_metadata(source_type, external_id);
CREATE INDEX idx_source_metadata_engagement ON source_metadata USING GIN(engagement_signals);

-- 모더레이션 플래그 테이블
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_flags_target ON moderation_flags(target_type, target_id);
CREATE INDEX idx_moderation_flags_status ON moderation_flags(status);
CREATE INDEX idx_moderation_flags_created_by ON moderation_flags(created_by);

-- 분류 테이블
CREATE TABLE taxonomy_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topics TEXT[] NOT NULL DEFAULT '{}',
  difficulty VARCHAR(20),
  tags TEXT[] NOT NULL DEFAULT '{}',
  language VARCHAR(10),
  quality_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_taxonomy_classifications_post_id ON taxonomy_classifications(post_id);
CREATE INDEX idx_taxonomy_classifications_topics ON taxonomy_classifications USING GIN(topics);
CREATE INDEX idx_taxonomy_classifications_tags ON taxonomy_classifications USING GIN(tags);
CREATE INDEX idx_taxonomy_classifications_quality_score ON taxonomy_classifications(quality_score DESC);

-- 업데이트 시간 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_submissions_updated_at BEFORE UPDATE ON link_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_source_metadata_updated_at BEFORE UPDATE ON source_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taxonomy_classifications_updated_at BEFORE UPDATE ON taxonomy_classifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

