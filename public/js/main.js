// 메인 애플리케이션 로직

let currentUser = null;
let game = null;
let socket = null;
let currentGameId = null;
let pvpOpponent = null;

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // 로그인 상태 확인
    try {
        const result = await API.getCurrentUser();
        if (result.user) {
            currentUser = result.user;
            showMainMenu();
        } else {
            UI.showScreen('auth-screen');
        }
    } catch (error) {
        UI.showScreen('auth-screen');
    }

    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 인증 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    // 로그인
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const result = await API.login(username, password);
            if (result.success) {
                currentUser = result.user;
                showMainMenu();
            } else {
                UI.showError('login-error', result.error || '로그인 실패');
            }
        } catch (error) {
            UI.showError('login-error', '로그인 중 오류가 발생했습니다.');
        }
    });

    // 회원가입
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value;

        try {
            const result = await API.register(username, password, email);
            if (result.success) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                document.querySelector('.tab-btn[data-tab="login"]').click();
            } else {
                UI.showError('register-error', result.error || '회원가입 실패');
            }
        } catch (error) {
            UI.showError('register-error', '회원가입 중 오류가 발생했습니다.');
        }
    });

    // 로그아웃
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await API.logout();
        currentUser = null;
        if (socket) {
            socket.disconnect();
        }
        UI.showScreen('auth-screen');
    });

    // AI 대전
    document.getElementById('ai-game-btn').addEventListener('click', () => {
        UI.showScreen('difficulty-screen');
    });

    // 난이도 선택
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            startAIGame(difficulty);
        });
    });

    // 1:1 대전
    document.getElementById('pvp-game-btn').addEventListener('click', () => {
        startPVPMatchmaking();
    });

    // 게임 불러오기
    document.getElementById('load-game-btn').addEventListener('click', async () => {
        await showSavedGames();
    });

    // 전적 보기
    document.getElementById('stats-btn').addEventListener('click', async () => {
        await showStats();
    });

    // 리더보드
    document.getElementById('leaderboard-btn').addEventListener('click', async () => {
        await showLeaderboard('overall');
    });

    // 리더보드 탭
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;

            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            showLeaderboard(mode);
        });
    });

    // 뒤로 가기 버튼들
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('back-from-saved-btn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('back-from-stats-btn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('back-from-leaderboard-btn').addEventListener('click', () => {
        showMainMenu();
    });

    // 게임 컨트롤
    document.getElementById('save-game-btn').addEventListener('click', () => {
        saveCurrentGame();
    });

    document.getElementById('surrender-btn').addEventListener('click', () => {
        if (confirm('정말 기권하시겠습니까?')) {
            if (game) {
                const winner = game.currentPlayer === 'black' ? 'white' : 'black';
                game.endGame(winner);
            }
        }
    });

    document.getElementById('exit-game-btn').addEventListener('click', () => {
        if (confirm('게임을 나가시겠습니까? (저장되지 않은 게임은 사라집니다)')) {
            showMainMenu();
        }
    });

    // 매칭 취소
    document.getElementById('cancel-match-btn').addEventListener('click', () => {
        if (socket) {
            socket.emit('cancel-match');
        }
        showMainMenu();
    });
}

// 메인 메뉴 표시
function showMainMenu() {
    document.getElementById('current-user').textContent = `환영합니다, ${currentUser.username}님`;
    UI.showScreen('menu-screen');
}

// AI 게임 시작
function startAIGame(difficulty) {
    UI.showScreen('game-screen');

    const difficultyText = {
        'easy': '초급',
        'medium': '중급',
        'hard': '고급'
    };

    document.getElementById('game-mode-title').textContent = `AI 대전 (${difficultyText[difficulty]})`;

    const canvas = document.getElementById('game-board');
    game = new OmokuGame(canvas);
    game.gameMode = 'ai';
    game.aiDifficulty = difficulty;
    game.aiColor = 'white';
    game.playerColor = 'black';

    game.onMove = (row, col, color) => {
        UI.updateTurn(game.currentPlayer);
    };

    game.onGameEnd = async (winner, totalMoves, gameDuration) => {
        let result, winnerId;

        if (!winner) {
            result = 'draw';
            winnerId = null;
            alert('무승부입니다!');
        } else if (winner === game.playerColor) {
            result = 'win';
            winnerId = currentUser.id;
            alert('승리했습니다!');
        } else {
            result = 'lose';
            winnerId = null;
            alert('패배했습니다.');
        }

        // 게임 결과 기록
        try {
            await API.recordGame('ai', difficulty, winnerId, result, totalMoves, gameDuration, null);
        } catch (error) {
            console.error('게임 결과 기록 오류:', error);
        }
    };

    UI.updateStatus('게임을 시작합니다!');
    UI.updateTurn('black');
}

// 1:1 대전 매칭 시작
function startPVPMatchmaking() {
    UI.showScreen('waiting-screen');

    if (!socket) {
        socket = io();
        setupSocketListeners();
    }

    socket.emit('find-match', {
        userId: currentUser.id,
        username: currentUser.username
    });
}

// Socket.IO 리스너 설정
function setupSocketListeners() {
    socket.on('waiting', () => {
        console.log('대기 중...');
    });

    socket.on('match-found', (data) => {
        currentGameId = data.gameId;
        pvpOpponent = data.opponent;

        startPVPGame(data.color);
    });

    socket.on('move-made', (data) => {
        if (game && !game.isGameOver) {
            game.board[data.row][data.col] = data.color;
            game.moveHistory.push({ row: data.row, col: data.col, color: data.color });
            game.currentPlayer = data.nextPlayer;
            game.myTurn = (data.nextPlayer === game.myColor);
            game.drawBoard();
            UI.updateTurn(game.currentPlayer);

            // 승리 확인
            if (game.checkWin(data.row, data.col, data.color)) {
                game.endGame(data.color);
            }
        }
    });

    socket.on('opponent-disconnected', () => {
        alert('상대방의 연결이 끊어졌습니다.');
        showMainMenu();
    });
}

// 1:1 게임 시작
function startPVPGame(myColor) {
    UI.showScreen('game-screen');
    document.getElementById('game-mode-title').textContent = `1:1 대전 vs ${pvpOpponent}`;

    const canvas = document.getElementById('game-board');
    game = new OmokuGame(canvas);
    game.gameMode = 'pvp';
    game.myColor = myColor;
    game.myTurn = (myColor === 'black');

    game.onMove = (row, col, color) => {
        // 서버에 착수 전송
        socket.emit('make-move', {
            gameId: currentGameId,
            row,
            col
        });

        UI.updateTurn(game.currentPlayer);
    };

    game.onGameEnd = async (winner, totalMoves, gameDuration) => {
        let result, winnerId, player2Id;

        if (!winner) {
            result = 'draw';
            winnerId = null;
        } else if (winner === game.myColor) {
            result = 'win';
            winnerId = currentUser.id;
            alert('승리했습니다!');
        } else {
            result = 'lose';
            winnerId = null; // 상대방이 승자
            alert('패배했습니다.');
        }

        // 서버에 게임 종료 알림
        socket.emit('game-over', {
            gameId: currentGameId,
            winner: winner
        });

        // 게임 결과 기록
        try {
            await API.recordGame('pvp', null, winnerId, result, totalMoves, gameDuration, null);
        } catch (error) {
            console.error('게임 결과 기록 오류:', error);
        }
    };

    const turnText = game.myTurn ? '내 차례' : '상대 차례';
    UI.updateStatus(`${myColor === 'black' ? '흑돌' : '백돌'}로 시작합니다. ${turnText}`);
    UI.updateTurn(game.currentPlayer);
}

// 게임 저장
function saveCurrentGame() {
    if (!game) return;

    UI.showSaveGameDialog(async (gameName) => {
        try {
            const result = await API.saveGame(
                gameName,
                game.board,
                game.currentPlayer,
                game.gameMode,
                game.aiDifficulty,
                game.moveHistory
            );

            if (result.success) {
                alert('게임이 저장되었습니다.');
            } else {
                alert('게임 저장 실패: ' + result.error);
            }
        } catch (error) {
            console.error('게임 저장 오류:', error);
            alert('게임 저장 중 오류가 발생했습니다.');
        }
    });
}

// 저장된 게임 목록 표시
async function showSavedGames() {
    try {
        const result = await API.getSavedGames();
        UI.renderSavedGames(result.games);
        UI.showScreen('saved-games-screen');
    } catch (error) {
        console.error('게임 목록 조회 오류:', error);
        alert('게임 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게임 불러오기
async function loadSavedGame(gameId) {
    try {
        const result = await API.loadGame(gameId);
        const gameData = result.game;

        // 게임 모드에 따라 시작
        if (gameData.gameMode === 'ai') {
            UI.showScreen('game-screen');

            const difficultyText = {
                'easy': '초급',
                'medium': '중급',
                'hard': '고급'
            };

            document.getElementById('game-mode-title').textContent =
                `AI 대전 (${difficultyText[gameData.aiDifficulty]})`;

            const canvas = document.getElementById('game-board');
            game = new OmokuGame(canvas);
            game.gameMode = 'ai';
            game.aiDifficulty = gameData.aiDifficulty;
            game.loadGameState(gameData.boardState, gameData.currentPlayer, gameData.moveHistory);

            game.onMove = (row, col, color) => {
                UI.updateTurn(game.currentPlayer);
            };

            game.onGameEnd = async (winner, totalMoves, gameDuration) => {
                let result, winnerId;

                if (!winner) {
                    result = 'draw';
                    winnerId = null;
                } else if (winner === game.playerColor) {
                    result = 'win';
                    winnerId = currentUser.id;
                    alert('승리했습니다!');
                } else {
                    result = 'lose';
                    winnerId = null;
                    alert('패배했습니다.');
                }

                await API.recordGame('ai', game.aiDifficulty, winnerId, result, totalMoves, gameDuration, null);
            };

            UI.updateStatus('저장된 게임을 불러왔습니다.');
            UI.updateTurn(gameData.currentPlayer);
        }
    } catch (error) {
        console.error('게임 불러오기 오류:', error);
        alert('게임을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게임 삭제
async function deleteSavedGame(gameId) {
    if (!confirm('정말 이 게임을 삭제하시겠습니까?')) return;

    try {
        const result = await API.deleteGame(gameId);
        if (result.success) {
            alert('게임이 삭제되었습니다.');
            showSavedGames(); // 목록 새로고침
        } else {
            alert('게임 삭제 실패: ' + result.error);
        }
    } catch (error) {
        console.error('게임 삭제 오류:', error);
        alert('게임 삭제 중 오류가 발생했습니다.');
    }
}

// 통계 표시
async function showStats() {
    try {
        const [statsResult, gamesResult] = await Promise.all([
            API.getUserStats(),
            API.getRecentGames(10)
        ]);

        UI.renderStats(statsResult.statistics);
        UI.renderRecentGames(gamesResult.games);
        UI.showScreen('stats-screen');
    } catch (error) {
        console.error('통계 조회 오류:', error);
        alert('통계를 불러오는 중 오류가 발생했습니다.');
    }
}

// 리더보드 표시
async function showLeaderboard(mode = 'overall') {
    try {
        const result = await API.getLeaderboard(mode, 10);
        UI.renderLeaderboard(result.leaderboard);
        UI.showScreen('leaderboard-screen');
    } catch (error) {
        console.error('리더보드 조회 오류:', error);
        alert('리더보드를 불러오는 중 오류가 발생했습니다.');
    }
}
