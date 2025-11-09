# Backend

Node.js + TypeScript + Express 기반 API 서버

## 개발 시작

```bash
npm install
npm run dev
```

## 주요 기능

### 서비스
- `LinkService`: 링크 제출 처리
- `PostService`: 게시글 생성 및 랭킹 계산
- `IngestWorker`: 링크 인제스트 처리

### 어댑터
- `YouTubeAdapter`: YouTube 영상 정보 수집
- `RedditAdapter`: Reddit 포스트 및 댓글 수집
- `StackOverflowAdapter`: StackOverflow 질문/답변 수집

### 워커
- `CronWorker`: 주기적으로 대기 중인 제출 처리

## API 엔드포인트

- `POST /api/links/submit`: 링크 제출
- `GET /api/posts/:id`: 게시글 조회
- `GET /api/posts`: 게시글 목록
- `POST /api/comments`: 댓글 작성

## 환경 변수

`.env.example` 파일을 참고하여 `.env` 파일 생성

## 데이터베이스

PostgreSQL 사용. 마이그레이션은 `database/` 디렉토리 참고.

