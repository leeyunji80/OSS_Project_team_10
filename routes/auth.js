const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '사용자명과 비밀번호는 필수입니다.' });
    }

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email]
        );

        // 통계 테이블 초기화
        await pool.query(
            'INSERT INTO user_statistics (user_id) VALUES (?)',
            [result.insertId]
        );

        res.json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            userId: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '이미 존재하는 사용자명입니다.' });
        }
        console.error('회원가입 오류:', error);
        res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '사용자명과 비밀번호를 입력하세요.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
        }

        // 세션에 사용자 정보 저장
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            success: true,
            message: '로그인 성공',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
    }
});

// 로그아웃
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: '로그아웃 실패' });
        }
        res.json({ success: true, message: '로그아웃 성공' });
    });
});

// 현재 사용자 정보 확인
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({ error: '사용자 정보 조회 실패' });
    }
});

module.exports = router;
