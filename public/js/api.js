// API 호출 관련 함수

const API = {
    // 회원가입
    async register(username, password, email) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });
        return await response.json();
    },

    // 로그인
    async login(username, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    // 로그아웃
    async logout() {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        return await response.json();
    },

    // 현재 사용자 정보
    async getCurrentUser() {
        const response = await fetch('/api/auth/me');
        return await response.json();
    },

    // AI 착수
    async getAIMove(board, aiColor, difficulty) {
        const response = await fetch('/api/game/ai-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board, aiColor, difficulty })
        });
        return await response.json();
    },

    // 게임 저장
    async saveGame(gameName, boardState, currentPlayer, gameMode, aiDifficulty, moveHistory) {
        const response = await fetch('/api/game/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameName,
                boardState,
                currentPlayer,
                gameMode,
                aiDifficulty,
                moveHistory
            })
        });
        return await response.json();
    },

    // 저장된 게임 목록
    async getSavedGames() {
        const response = await fetch('/api/game/saved-games');
        return await response.json();
    },

    // 게임 불러오기
    async loadGame(gameId) {
        const response = await fetch(`/api/game/load/${gameId}`);
        return await response.json();
    },

    // 게임 삭제
    async deleteGame(gameId) {
        const response = await fetch(`/api/game/delete/${gameId}`, {
            method: 'DELETE'
        });
        return await response.json();
    },

    // 게임 결과 기록
    async recordGame(gameMode, aiDifficulty, winnerId, result, totalMoves, gameDuration, player2Id) {
        const response = await fetch('/api/game/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameMode,
                aiDifficulty,
                winnerId,
                result,
                totalMoves,
                gameDuration,
                player2Id
            })
        });
        return await response.json();
    },

    // 사용자 통계
    async getUserStats() {
        const response = await fetch('/api/stats/user');
        return await response.json();
    },

    // 최근 게임 기록
    async getRecentGames(limit = 10) {
        const response = await fetch(`/api/stats/recent-games?limit=${limit}`);
        return await response.json();
    },

    // 리더보드
    async getLeaderboard(mode = 'overall', limit = 10) {
        const response = await fetch(`/api/stats/leaderboard?mode=${mode}&limit=${limit}`);
        return await response.json();
    }
};
