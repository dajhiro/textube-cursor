# TexTube - 링크 기반 지식 수집 플랫폼

영어/한국어 자료를 자동으로 요약하고 고품질 번역을 제공하는 링크 수집 플랫폼입니다.

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (선택, 개발 환경용)

### 개발 환경 설정

1. **저장소 클론 및 의존성 설치**
```bash
git clone <repository-url>
cd textube-cursor
npm install
```

2. **데이터베이스 설정**
```bash
# Docker Compose로 데이터베이스 실행
docker-compose up -d postgres redis minio

# 데이터베이스 마이그레이션 실행
cd database
psql -U textube -d textube -f migrations/001_initial_schema.sql
# 또는
npm run migrate
```

3. **환경 변수 설정**
```bash
# 백엔드
cd backend
cp .env.example .env
# .env 파일 편집 (데이터베이스 URL, API 키 등)

# 프론트엔드
cd ../frontend
# 필요시 환경 변수 설정
```

4. **개발 서버 실행**
```bash
# 루트 디렉토리에서
npm run dev

# 또는 개별 실행
npm run dev:backend  # 백엔드 (포트 3001)
npm run dev:frontend # 프론트엔드 (포트 3000)
```

## 핵심 기능

### 게시글 시스템
- 동일 링크는 하나의 게시글로 통합
- 게시글 메타데이터:
  - `view`: 조회수
  - `url`: 정규화된 URL (ID)
  - `본문`: 원문/요약/번역 (영어/한국어)
  - `작성자`: 최초 작성자 (익명 가능)
  - `작성 시도자`: 최초 작성자 외 모든 제출 시도자
  - `댓글`: 플랫폼 내 회원 댓글만

### 링크 처리
- **안전한 링크만 허용**: 화이트리스트 기반 도메인 검증
- **로그인 필수**: 링크 제출은 인증된 사용자만 가능
- **AI 자동 분류**: 링크 유형/토픽 자동 분류
- **지원 소스**:
  - YouTube (제목, 설명, 자막)
  - Reddit (본문 + 상위 댓글)
  - StackOverflow (질문 + 답변)
  - 기타 화이트리스트 도메인

### 콘텐츠 처리
- **자동 요약**: 영어/한국어 원문 요약
- **고품질 번역**: 양방향 번역 (영↔한)
- **품질 향상 루프**: 피드백 기반 재생성

### 랭킹 시스템
- 동일 링크의 순위는 다음 요소에 영향:
  - 조회수
  - 작성 시도자 수 및 신뢰도
  - 댓글 반응
  - 외부 소스 engagement 신호

### 스팸/홍보 방지
- 안전하지 않은 URL 자동 차단
- 스팸 콘텐츠 자동 감지
- 신고 기반 모더레이션

## 기술 스택

### Backend
- Node.js + TypeScript
- Express
- PostgreSQL
- Redis (캐시/큐)
- S3 호환 객체 스토리지 (MinIO)

### Frontend
- Next.js + TypeScript
- React

### AI/ML
- 요약/번역: OpenAI API 또는 자체 모델
- 분류: 토픽/언어/품질 자동 분류

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

## 주요 API

### 링크 제출
```
POST /api/links/submit
Headers: {
  x-user-id: string (임시, 실제로는 JWT 토큰 사용)
}
Body: { url: string, note?: string }
Response: { submissionId: string, status: string, postId?: string }
```

### 게시글 조회
```
GET /api/posts/:id
Response: { post: Post, links: [...], attempts: [...], comments: [...], ... }
```

### 게시글 목록
```
GET /api/posts?limit=20&offset=0&sort=rank
Response: { posts: Post[], total: number }
```

### 댓글 작성
```
POST /api/comments
Body: { postId: string, body: string, parentCommentId?: string }
```

## 개발 가이드

자세한 개발 가이드는 [DEVELOPMENT.md](./DEVELOPMENT.md)를 참고하세요.

## 구현 상태

### ✅ 완료
- 프로젝트 구조 생성
- 데이터베이스 스키마 설계
- 백엔드 API 서버 기본 구조
- 링크 제출 API
- URL 정규화 및 안전성 검사
- 소스 어댑터 (YouTube, Reddit, StackOverflow)
- 인제스트 워커
- 프론트엔드 기본 UI
- 랭킹 시스템 기본 구현

### 🚧 진행 중 / TODO
- 요약/번역 서비스 구현
- AI 분류 시스템
- 인증/인가 시스템 (JWT)
- 스팸/모더레이션 시스템
- 객체 스토리지 통합
- Redis 큐 통합
- 프론트엔드 UI 개선

## 라이선스

MIT
