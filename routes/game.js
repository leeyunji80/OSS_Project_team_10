const express = require('express');
const { pool } = require('../db');
const { findBestMove } = require('../ai');
const { checkWin, isValidMove } = require('../gameLogic');

const router = express.Router();

// 인증 미들웨어
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    next();
}

// AI 착수 요청
router.post('/ai-move', requireAuth, (req, res) => {
    const { board, aiColor, difficulty } = req.body;

    if (!board || !aiColor || !difficulty) {
        return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    try {
        const move = findBestMove(board, aiColor, difficulty);
        res.json({ move });
    } catch (error) {
        console.error('AI 착수 오류:', error);
        res.status(500).json({ error: 'AI 착수 계산 중 오류가 발생했습니다.' });
    }
});

// 게임 저장
router.post('/save', requireAuth, async (req, res) => {
    const { gameName, boardState, currentPlayer, gameMode, aiDifficulty, moveHistory } = req.body;
    const userId = req.session.userId;

    if (!gameName || !boardState || !currentPlayer || !gameMode) {
        return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    try {
        // 기존에 같은 이름의 게임이 있는지 확인
        const [existing] = await pool.query(
            'SELECT id FROM saved_games WHERE user_id = ? AND game_name = ?',
            [userId, gameName]
        );

        if (existing.length > 0) {
            // 업데이트
            await pool.query(
                `UPDATE saved_games
                SET board_state = ?, current_player = ?, game_mode = ?,
                    ai_difficulty = ?, move_history = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    JSON.stringify(boardState),
                    currentPlayer,
                    gameMode,
                    aiDifficulty,
                    JSON.stringify(moveHistory || []),
                    existing[0].id
                ]
            );
            res.json({ success: true, message: '게임이 업데이트되었습니다.', gameId: existing[0].id });
        } else {
            // 새로 저장
            const [result] = await pool.query(
                `INSERT INTO saved_games
                (user_id, game_name, board_state, current_player, game_mode, ai_difficulty, move_history)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    gameName,
                    JSON.stringify(boardState),
                    currentPlayer,
                    gameMode,
                    aiDifficulty,
                    JSON.stringify(moveHistory || [])
                ]
            );
            res.json({ success: true, message: '게임이 저장되었습니다.', gameId: result.insertId });
        }
    } catch (error) {
        console.error('게임 저장 오류:', error);
        res.status(500).json({ error: '게임 저장 중 오류가 발생했습니다.' });
    }
});

// 저장된 게임 목록 조회
router.get('/saved-games', requireAuth, async (req, res) => {
    const userId = req.session.userId;

    try {
        const [games] = await pool.query(
            `SELECT id, game_name, game_mode, ai_difficulty, current_player,
                    created_at, updated_at
            FROM saved_games
            WHERE user_id = ?
            ORDER BY updated_at DESC`,
            [userId]
        );

        res.json({ games });
    } catch (error) {
        console.error('게임 목록 조회 오류:', error);
        res.status(500).json({ error: '게임 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 게임 불러오기
router.get('/load/:gameId', requireAuth, async (req, res) => {
    const { gameId } = req.params;
    const userId = req.session.userId;

    try {
        const [games] = await pool.query(
            `SELECT * FROM saved_games WHERE id = ? AND user_id = ?`,
            [gameId, userId]
        );

        if (games.length === 0) {
            return res.status(404).json({ error: '게임을 찾을 수 없습니다.' });
        }

        const game = games[0];
        res.json({
            game: {
                id: game.id,
                gameName: game.game_name,
                boardState: JSON.parse(game.board_state),
                currentPlayer: game.current_player,
                gameMode: game.game_mode,
                aiDifficulty: game.ai_difficulty,
                moveHistory: JSON.parse(game.move_history || '[]')
            }
        });
    } catch (error) {
        console.error('게임 불러오기 오류:', error);
        res.status(500).json({ error: '게임을 불러오는 중 오류가 발생했습니다.' });
    }
});

// 게임 삭제
router.delete('/delete/:gameId', requireAuth, async (req, res) => {
    const { gameId } = req.params;
    const userId = req.session.userId;

    try {
        const [result] = await pool.query(
            'DELETE FROM saved_games WHERE id = ? AND user_id = ?',
            [gameId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '게임을 찾을 수 없습니다.' });
        }

        res.json({ success: true, message: '게임이 삭제되었습니다.' });
    } catch (error) {
        console.error('게임 삭제 오류:', error);
        res.status(500).json({ error: '게임 삭제 중 오류가 발생했습니다.' });
    }
});

// 게임 결과 기록
router.post('/record', requireAuth, async (req, res) => {
    const { gameMode, aiDifficulty, winnerId, result, totalMoves, gameDuration, player2Id } = req.body;
    const player1Id = req.session.userId;

    if (!gameMode || !result || !totalMoves) {
        return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    try {
        // 게임 기록 저장
        await pool.query(
            `INSERT INTO game_records
            (player1_id, player2_id, game_mode, ai_difficulty, winner_id, result, total_moves, game_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [player1Id, player2Id || null, gameMode, aiDifficulty, winnerId, result, totalMoves, gameDuration]
        );

        // 통계 업데이트
        await updateUserStatistics(player1Id, gameMode, aiDifficulty, result);

        if (player2Id && gameMode === 'pvp') {
            const player2Result = result === 'win' ? 'lose' : (result === 'lose' ? 'win' : 'draw');
            await updateUserStatistics(player2Id, gameMode, null, player2Result);
        }

        res.json({ success: true, message: '게임 결과가 기록되었습니다.' });
    } catch (error) {
        console.error('게임 결과 기록 오류:', error);
        res.status(500).json({ error: '게임 결과 기록 중 오류가 발생했습니다.' });
    }
});

// 통계 업데이트 헬퍼 함수
async function updateUserStatistics(userId, gameMode, aiDifficulty, result) {
    const updates = {
        total_games: 1,
        wins: result === 'win' ? 1 : 0,
        losses: result === 'lose' ? 1 : 0,
        draws: result === 'draw' ? 1 : 0
    };

    if (gameMode === 'ai' && result === 'win') {
        if (aiDifficulty === 'easy') updates.ai_easy_wins = 1;
        else if (aiDifficulty === 'medium') updates.ai_medium_wins = 1;
        else if (aiDifficulty === 'hard') updates.ai_hard_wins = 1;
    } else if (gameMode === 'pvp' && result === 'win') {
        updates.pvp_wins = 1;
    }

    await pool.query(
        `INSERT INTO user_statistics (user_id, total_games, wins, losses, draws,
                                      ai_easy_wins, ai_medium_wins, ai_hard_wins, pvp_wins)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_games = total_games + VALUES(total_games),
            wins = wins + VALUES(wins),
            losses = losses + VALUES(losses),
            draws = draws + VALUES(draws),
            ai_easy_wins = ai_easy_wins + VALUES(ai_easy_wins),
            ai_medium_wins = ai_medium_wins + VALUES(ai_medium_wins),
            ai_hard_wins = ai_hard_wins + VALUES(ai_hard_wins),
            pvp_wins = pvp_wins + VALUES(pvp_wins)`,
        [
            userId,
            updates.total_games,
            updates.wins,
            updates.losses,
            updates.draws,
            updates.ai_easy_wins || 0,
            updates.ai_medium_wins || 0,
            updates.ai_hard_wins || 0,
            updates.pvp_wins || 0
        ]
    );
}

module.exports = router;
