const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// 인증 미들웨어
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    next();
}

// 사용자 통계 조회
router.get('/user', requireAuth, async (req, res) => {
    const userId = req.session.userId;

    try {
        const [stats] = await pool.query(
            `SELECT * FROM user_statistics WHERE user_id = ?`,
            [userId]
        );

        if (stats.length === 0) {
            // 통계가 없으면 초기화
            await pool.query(
                'INSERT INTO user_statistics (user_id) VALUES (?)',
                [userId]
            );
            return res.json({
                statistics: {
                    total_games: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    ai_easy_wins: 0,
                    ai_medium_wins: 0,
                    ai_hard_wins: 0,
                    pvp_wins: 0,
                    win_rate: 0
                }
            });
        }

        const stat = stats[0];
        const winRate = stat.total_games > 0
            ? ((stat.wins / stat.total_games) * 100).toFixed(2)
            : 0;

        res.json({
            statistics: {
                total_games: stat.total_games,
                wins: stat.wins,
                losses: stat.losses,
                draws: stat.draws,
                ai_easy_wins: stat.ai_easy_wins,
                ai_medium_wins: stat.ai_medium_wins,
                ai_hard_wins: stat.ai_hard_wins,
                pvp_wins: stat.pvp_wins,
                win_rate: winRate
            }
        });
    } catch (error) {
        console.error('통계 조회 오류:', error);
        res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
    }
});

// 최근 게임 기록 조회
router.get('/recent-games', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const [games] = await pool.query(
            `SELECT
                gr.*,
                u1.username as player1_name,
                u2.username as player2_name,
                w.username as winner_name
            FROM game_records gr
            LEFT JOIN users u1 ON gr.player1_id = u1.id
            LEFT JOIN users u2 ON gr.player2_id = u2.id
            LEFT JOIN users w ON gr.winner_id = w.id
            WHERE gr.player1_id = ? OR gr.player2_id = ?
            ORDER BY gr.played_at DESC
            LIMIT ?`,
            [userId, userId, limit]
        );

        res.json({ games });
    } catch (error) {
        console.error('최근 게임 기록 조회 오류:', error);
        res.status(500).json({ error: '게임 기록 조회 중 오류가 발생했습니다.' });
    }
});

// 리더보드 조회
router.get('/leaderboard', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const mode = req.query.mode || 'overall'; // overall, pvp, ai

    try {
        let orderBy = 'wins DESC';
        if (mode === 'pvp') {
            orderBy = 'pvp_wins DESC';
        } else if (mode === 'ai') {
            orderBy = '(ai_easy_wins + ai_medium_wins + ai_hard_wins) DESC';
        }

        const [leaderboard] = await pool.query(
            `SELECT
                us.*,
                u.username,
                CASE
                    WHEN us.total_games > 0 THEN ROUND((us.wins / us.total_games) * 100, 2)
                    ELSE 0
                END as win_rate
            FROM user_statistics us
            JOIN users u ON us.user_id = u.id
            WHERE us.total_games > 0
            ORDER BY ${orderBy}
            LIMIT ?`,
            [limit]
        );

        res.json({ leaderboard });
    } catch (error) {
        console.error('리더보드 조회 오류:', error);
        res.status(500).json({ error: '리더보드 조회 중 오류가 발생했습니다.' });
    }
});

// 특정 사용자 통계 조회 (다른 사용자 조회 가능)
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [users] = await pool.query(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const [stats] = await pool.query(
            'SELECT * FROM user_statistics WHERE user_id = ?',
            [userId]
        );

        const stat = stats.length > 0 ? stats[0] : {
            total_games: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            ai_easy_wins: 0,
            ai_medium_wins: 0,
            ai_hard_wins: 0,
            pvp_wins: 0
        };

        const winRate = stat.total_games > 0
            ? ((stat.wins / stat.total_games) * 100).toFixed(2)
            : 0;

        res.json({
            user: users[0],
            statistics: {
                ...stat,
                win_rate: winRate
            }
        });
    } catch (error) {
        console.error('사용자 통계 조회 오류:', error);
        res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
