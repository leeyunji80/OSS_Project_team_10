# 오목 게임 설치 가이드

## 빠른 시작 가이드

### 1. 필수 프로그램 설치

#### Node.js 설치
- [Node.js 공식 웹사이트](https://nodejs.org/)에서 LTS 버전 다운로드 및 설치
- 설치 확인: `node --version` (v14 이상)

#### MySQL 설치
- [MySQL 공식 웹사이트](https://dev.mysql.com/downloads/mysql/)에서 다운로드
- 또는 Mac의 경우: `brew install mysql`
- Windows의 경우: MySQL Installer 사용

### 2. MySQL 설정

#### MySQL 서버 시작
```bash
# Mac (Homebrew)
brew services start mysql

# Windows
서비스에서 MySQL 시작

# Linux
sudo systemctl start mysql
```

#### MySQL 접속 및 데이터베이스 생성
```bash
mysql -u root -p
```

비밀번호 입력 후, 다음 명령어 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS omoku_game;

-- 사용자 생성 (선택사항)
CREATE USER 'omoku_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON omoku_game.* TO 'omoku_user'@'localhost';
FLUSH PRIVILEGES;

-- 종료
exit;
```

#### 테이블 생성
프로젝트 디렉토리에서:

```bash
# 방법 1: 파일로 직접 import
mysql -u root -p omoku_game < database.sql

# 방법 2: MySQL CLI에서
mysql -u root -p
use omoku_game;
source database.sql;
```

### 3. 프로젝트 설정

#### 의존성 설치
```bash
cd omoku
npm install
```

#### 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열어서 본인의 설정에 맞게 수정:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=omoku_game
DB_PORT=3306
SESSION_SECRET=random_secret_key_here_change_this
PORT=3000
```

**중요:** `SESSION_SECRET`는 랜덤한 문자열로 변경하세요!

### 4. 서버 실행

```bash
npm start
```

또는 개발 모드 (자동 재시작):

```bash
npm run dev
```

### 5. 접속

브라우저를 열고 다음 주소로 접속:

```
http://localhost:3000
```

## 문제 해결

### MySQL 연결 오류

**오류:** `ER_NOT_SUPPORTED_AUTH_MODE`

**해결:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### 포트 충돌

**오류:** `Port 3000 is already in use`

**해결:** `.env` 파일에서 다른 포트 번호 사용
```env
PORT=3001
```

### 의존성 설치 오류

**해결:**
```bash
# 캐시 삭제
npm cache clean --force

# 재설치
rm -rf node_modules
npm install
```

## 개발 모드 vs 프로덕션 모드

### 개발 모드
```bash
npm run dev
```
- nodemon 사용으로 코드 변경 시 자동 재시작
- 디버깅에 적합

### 프로덕션 모드
```bash
npm start
```
- 안정적인 운영
- 실제 배포 시 사용

## 추가 설정 (선택사항)

### HTTPS 사용

`server.js`에서 HTTPS 설정 추가:

```javascript
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('path/to/private.key'),
    cert: fs.readFileSync('path/to/certificate.crt')
};

const server = https.createServer(options, app);
```

### 데이터베이스 백업

정기적으로 데이터베이스 백업:

```bash
mysqldump -u root -p omoku_game > backup_$(date +%Y%m%d).sql
```

### 복원

```bash
mysql -u root -p omoku_game < backup_20231201.sql
```

## 테스트 계정 생성 (개발용)

서버 실행 후 브라우저에서:

1. 회원가입 페이지에서 테스트 계정 생성
   - 사용자명: test1
   - 비밀번호: test123
   - 이메일: test1@example.com

2. 다른 브라우저/시크릿 모드에서 두 번째 계정 생성
   - 사용자명: test2
   - 비밀번호: test123
   - 이메일: test2@example.com

3. 1:1 대전 테스트 가능

## 완료!

이제 오목 게임을 즐기실 수 있습니다!

- AI 대전으로 실력 향상
- 친구와 1:1 대전
- 게임 저장/불러오기로 언제든 재개
- 리더보드에서 최고 기록 도전
