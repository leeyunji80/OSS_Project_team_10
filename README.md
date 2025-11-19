# Omoku (오목) Game

웹 기반 오목 게임 with AI and Multiplayer

## Features

- 🤖 AI 대전 (초급/중급/고급)
- 👥 1:1 실시간 대전
- 💾 게임 저장/불러오기
- 📊 전적 및 통계
- 🔐 사용자 인증 시스템

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL
- **Real-time**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript (Canvas API)
- **AI**: Minimax algorithm with alpha-beta pruning

## Prerequisites

- Node.js 14.x 이상
- MySQL 5.7 이상

## Installation

### 1. Clone or download this project

### 2. Install dependencies

```bash
npm install
```

### 3. MySQL 데이터베이스 설정

MySQL에 접속하여 데이터베이스를 생성합니다:

```bash
mysql -u root -p < database.sql
```

또는 MySQL CLI에서:

```sql
source database.sql
```

### 4. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 본인의 MySQL 설정에 맞게 수정합니다:

```bash
cp .env.example .env
```

`.env` 파일 예시:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=omoku_game
DB_PORT=3306
SESSION_SECRET=your_random_secret_key
PORT=3000
```

## Run

```bash
npm start
```

개발 모드 (nodemon):

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## Usage

### 1. 회원가입 및 로그인

- 메인 페이지에서 회원가입 후 로그인

### 2. AI 대전

- "AI 대전" 선택
- 난이도 선택 (초급/중급/고급)
- 게임 플레이
- 게임 중 "저장" 버튼으로 게임 저장 가능

### 3. 1:1 대전

- "1:1 대전" 선택
- 자동 매칭 대기
- 상대 발견 시 게임 시작

### 4. 게임 불러오기

- "게임 불러오기" 메뉴에서 저장된 게임 선택
- 저장된 상태에서 게임 재개

### 5. 통계 및 리더보드

- "전적 보기"에서 개인 통계 확인
- "리더보드"에서 전체/1:1/AI 랭킹 확인

## AI Algorithm

Minimax algorithm with alpha-beta pruning

**난이도별 탐색 깊이:**
- 초급: Depth 2 (실수 30% 확률)
- 중급: Depth 3
- 고급: Depth 4

**최적화 기법:**
- Alpha-Beta Pruning
- 휴리스틱 평가 함수
- 근접 영역 우선 탐색

## Database Schema

### users
- 사용자 정보 저장

### saved_games
- 저장된 게임 상태

### game_records
- 완료된 게임 전적

### user_statistics
- 사용자별 통계 (캐시)

## Project Structure

```
omoku/
├── server.js              # 메인 서버
├── db.js                  # 데이터베이스 연결
├── gameLogic.js           # 오목 게임 로직
├── ai.js                  # Minimax AI
├── routes/
│   ├── auth.js           # 인증 라우트
│   ├── game.js           # 게임 라우트
│   └── stats.js          # 통계 라우트
├── public/
│   ├── index.html        # 메인 HTML
│   ├── css/
│   │   └── style.css     # 스타일시트
│   └── js/
│       ├── api.js        # API 호출
│       ├── game.js       # 게임 로직 (클라이언트)
│       ├── ui.js         # UI 관리
│       └── main.js       # 메인 앱 로직
├── database.sql          # DB 스키마
├── package.json
└── README.md
```

## License

MIT
