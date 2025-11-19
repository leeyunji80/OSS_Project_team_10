const mysql = require('mysql2');
require('dotenv').config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'omoku_game',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promise 기반 인터페이스 사용
const promisePool = pool.promise();

// 데이터베이스 초기화 함수
async function initializeDatabase() {
    try {
        // 연결 테스트
        const connection = await promisePool.getConnection();
        console.log('MySQL 데이터베이스 연결 성공');
        connection.release();
    } catch (error) {
        console.error('MySQL 연결 실패:', error);
        process.exit(1);
    }
}

module.exports = {
    pool: promisePool,
    initializeDatabase
};
