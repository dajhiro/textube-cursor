# 개발 가이드

## 프로젝트 구조

```
textube-cursor/
├── backend/              # API 서버
│   ├── src/
│   │   ├── api/         # API 라우트
│   │   ├── services/    # 비즈니스 로직
│   │   ├── adapters/    # 소스 어댑터 (YouTube, Reddit, etc.)
│   │   ├── workers/     # 백그라운드 워커
│   │   ├── db/          # 데이터베이스 클라이언트
│   │   ├── utils/       # 유틸리티
│   │   └── config/      # 설정
│   └── package.json
├── frontend/            # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # React 컴포넌트
│   │   └── lib/         # 클라이언트 라이브러리
│   └── package.json
├── database/            # 데이터베이스 스키마
│   └── migrations/      # 마이그레이션 파일
├── shared/              # 공통 타입/유틸
│   └── src/
│       └── types/       # TypeScript 타입 정의
└── docker-compose.yml   # 개발 환경 설정
```

## 주요 기능 구현 상태

### ✅ 완료
- 프로젝트 구조 생성
- 데이터베이스 스키마 설계
- 백엔드 API 서버 기본 구조
- 링크 제출 API
- URL 정규화 및 안전성 검사
- 소스 어댑터 (YouTube, Reddit, StackOverflow)
- 인제스트 워커
- 프론트엔드 기본 UI

### 🚧 진행 중 / TODO
- 요약/번역 서비스 구현
- AI 분류 시스템
- 인증/인가 시스템
- 랭킹 알고리즘 개선
- 스팸/모더레이션 시스템
- 객체 스토리지 통합
- Redis 큐 통합

## API 엔드포인트

### 링크 제출
```
POST /api/links/submit
Headers: {
  x-user-id: string (임시, 실제로는 JWT 토큰 사용)
}
Body: {
  url: string
  note?: string
}
Response: {
  submissionId: string
  status: 'pending' | 'completed' | 'rejected'
  postId?: string
}
```

### 게시글 조회
```
GET /api/posts/:id
Response: {
  post: Post
  links: PostLink[]
  attempts: PostAttempt[]
  comments: Comment[]
  sourceMetadata: SourceMetadata | null
  classification: TaxonomyClassification | null
}
```

### 게시글 목록
```
GET /api/posts?limit=20&offset=0&sort=rank
Response: {
  posts: Post[]
  total: number
}
```

### 댓글 작성
```
POST /api/comments
Headers: {
  x-user-id: string
}
Body: {
  postId: string
  body: string
  parentCommentId?: string
  lang?: string
}
```

## 데이터베이스

### 주요 테이블
- `users`: 사용자 정보
- `link_submissions`: 링크 제출 기록
- `posts`: 게시글 (동일 링크 통합)
- `post_links`: 게시글의 링크 변형들
- `post_attempts`: 작성 시도자 기록
- `comments`: 댓글
- `source_metadata`: 소스별 메타데이터
- `moderation_flags`: 모더레이션 플래그
- `taxonomy_classifications`: AI 분류 결과

## 개발 워크플로우

### 새 기능 추가
1. 공통 타입 정의 (`shared/src/types`)
2. 데이터베이스 마이그레이션 (필요시)
3. 백엔드 서비스 구현
4. API 엔드포인트 추가
5. 프론트엔드 컴포넌트 구현

### 테스트
```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
```

## 환경 변수

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://textube:textube_dev@localhost:5432/textube
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-api-key
YOUTUBE_API_KEY=your-api-key
JWT_SECRET=change-me-in-production
```

## 배포

### 프로덕션 빌드
```bash
npm run build
```

### Docker 배포
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 문제 해결

### 데이터베이스 연결 오류
- PostgreSQL이 실행 중인지 확인
- DATABASE_URL 환경 변수 확인
- 데이터베이스 마이그레이션 실행 확인

### API 요청 실패
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 인증 토큰 확인

### 소스 어댑터 오류
- API 키 설정 확인
- 네트워크 연결 확인
- 소스별 API 제한 확인

