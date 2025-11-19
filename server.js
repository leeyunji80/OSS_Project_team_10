const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const statsRoutes = require('./routes/stats');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'omoku-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // HTTPS를 사용할 경우 true로 설정
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/stats', statsRoutes);

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO 실시간 대전 처리
const waitingPlayers = [];
const activeGames = new Map();

io.on('connection', (socket) => {
    console.log('새로운 연결:', socket.id);

    // 1:1 대전 매칭
    socket.on('find-match', (data) => {
        const player = {
            id: socket.id,
            userId: data.userId,
            username: data.username
        };

        if (waitingPlayers.length > 0) {
            // 매칭 성공
            const opponent = waitingPlayers.shift();
            const gameId = `game-${Date.now()}`;

            const game = {
                id: gameId,
                player1: opponent,
                player2: player,
                board: Array(15).fill(null).map(() => Array(15).fill(null)),
                currentPlayer: 'black',
                moveHistory: []
            };

            activeGames.set(gameId, game);

            // 양쪽 플레이어에게 게임 시작 알림
            io.to(opponent.id).emit('match-found', {
                gameId,
                opponent: player.username,
                color: 'black'
            });

            io.to(player.id).emit('match-found', {
                gameId,
                opponent: opponent.username,
                color: 'white'
            });

            // 방에 추가
            socket.join(gameId);
            io.sockets.sockets.get(opponent.id)?.join(gameId);
        } else {
            // 대기열에 추가
            waitingPlayers.push(player);
            socket.emit('waiting');
        }
    });

    // 매칭 취소
    socket.on('cancel-match', () => {
        const index = waitingPlayers.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
        }
    });

    // 착수
    socket.on('make-move', (data) => {
        const { gameId, row, col } = data;
        const game = activeGames.get(gameId);

        if (!game) return;

        // 착수 처리
        const currentColor = game.currentPlayer;
        game.board[row][col] = currentColor;
        game.moveHistory.push({ row, col, color: currentColor });

        // 다음 플레이어로 변경
        game.currentPlayer = currentColor === 'black' ? 'white' : 'black';

        // 방의 모든 플레이어에게 알림
        io.to(gameId).emit('move-made', {
            row,
            col,
            color: currentColor,
            nextPlayer: game.currentPlayer
        });
    });

    // 게임 종료
    socket.on('game-over', (data) => {
        const { gameId, winner } = data;
        io.to(gameId).emit('game-ended', { winner });
        activeGames.delete(gameId);
    });

    // 연결 해제
    socket.on('disconnect', () => {
        console.log('연결 해제:', socket.id);

        // 대기열에서 제거
        const index = waitingPlayers.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
        }

        // 진행 중인 게임 찾아서 상대에게 알림
        for (const [gameId, game] of activeGames.entries()) {
            if (game.player1.id === socket.id || game.player2.id === socket.id) {
                io.to(gameId).emit('opponent-disconnected');
                activeGames.delete(gameId);
            }
        }
    });
});

// 서버 시작
async function startServer() {
    try {
        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`http://localhost:${PORT} 에서 접속하세요.`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer();
