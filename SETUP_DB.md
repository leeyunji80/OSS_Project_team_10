# MySQL 데이터베이스 설정 가이드

## 1단계: MySQL 접속

터미널에서 MySQL에 접속합니다:

```bash
mysql -u root -p
```

비밀번호를 입력하세요.

## 2단계: 데이터베이스 생성 및 테이블 생성

MySQL 프롬프트에서 다음 명령어를 실행하세요:

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS omoku_game;

-- 데이터베이스 선택
USE omoku_game;

-- 테이블 생성 (database.sql 파일 내용)
```

그 다음 `database.sql` 파일의 내용을 복사해서 붙여넣거나, 아래 명령어로 직접 import:

```bash
# MySQL CLI에서 나간 후 터미널에서:
mysql -u root -p omoku_game < database.sql
```

## 3단계: .env 파일 수정

`/Users/simhyunseok/Desktop/omoku/.env` 파일을 열어서 MySQL 비밀번호를 입력하세요:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=여기에_본인의_MySQL_비밀번호_입력
DB_NAME=omoku_game
DB_PORT=3306
SESSION_SECRET=omoku_secret_key_2024_change_this_in_production
PORT=3001
```

## 4단계: 서버 실행

```bash
cd /Users/simhyunseok/Desktop/omoku
npm start
```

## 5단계: 브라우저 접속

```
http://localhost:3001
```

---

## 빠른 설정 (한 번에 실행)

터미널에서:

```bash
# 1. MySQL 접속 및 database.sql 실행
mysql -u root -p omoku_game < database.sql

# 만약 데이터베이스가 없다면:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS omoku_game;"
mysql -u root -p omoku_game < database.sql

# 2. .env 파일 수정 (비밀번호 입력)
# 텍스트 에디터로 .env 파일을 열어서 DB_PASSWORD 수정

# 3. 서버 실행
npm start
```

## 트러블슈팅

### MySQL이 실행되지 않는 경우

```bash
# MySQL 시작
brew services start mysql

# 또는
mysql.server start
```

### 비밀번호를 모르는 경우

MySQL 비밀번호를 재설정해야 합니다:

```bash
# MySQL 안전 모드로 시작
sudo mysqld_safe --skip-grant-tables &

# 새 터미널에서
mysql -u root

# MySQL에서:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
exit;

# MySQL 재시작
brew services restart mysql
```
