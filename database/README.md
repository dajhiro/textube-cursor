# 데이터베이스

PostgreSQL 데이터베이스 스키마 및 마이그레이션 파일

## 설정

### 환경 변수
```bash
DATABASE_URL=postgresql://textube:textube_dev@localhost:5432/textube
```

### 마이그레이션 실행
```bash
npm run migrate
```

## 스키마 구조

### 주요 테이블
- `users`: 사용자 정보
- `link_submissions`: 링크 제출 기록
- `posts`: 게시글 (동일 링크 통합)
- `post_links`: 게시글의 링크 변형들
- `post_attempts`: 작성 시도자 기록
- `comments`: 댓글
- `source_metadata`: 소스별 메타데이터 (YouTube, Reddit, etc.)
- `moderation_flags`: 모더레이션 플래그
- `taxonomy_classifications`: AI 분류 결과

## 인덱스

- 조회수/랭킹 기반 조회 최적화
- URL 정규화 기반 중복 검사
- 사용자별 활동 추적
- 소스별 외부 ID 조회

