// 게임 로직 클래스

class OmokuGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.boardSize = 15;
        this.cellSize = canvas.width / (this.boardSize + 1);
        this.board = this.createEmptyBoard();
        this.currentPlayer = 'black';
        this.gameMode = null; // 'ai' or 'pvp'
        this.aiDifficulty = null;
        this.aiColor = 'white';
        this.playerColor = 'black';
        this.isGameOver = false;
        this.moveHistory = [];
        this.isAIThinking = false;
        this.gameStartTime = Date.now();
        this.onGameEnd = null;
        this.onMove = null;
        this.myTurn = true; // PVP 모드에서 사용
        this.myColor = 'black'; // PVP 모드에서 내 색

        this.drawBoard();
        this.setupClickHandler();
    }

    createEmptyBoard() {
        return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
    }

    drawBoard() {
        const ctx = this.ctx;
        const cellSize = this.cellSize;

        // 배경
        ctx.fillStyle = '#daa520';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 그리드
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        for (let i = 0; i < this.boardSize; i++) {
            // 세로선
            ctx.beginPath();
            ctx.moveTo(cellSize * (i + 1), cellSize);
            ctx.lineTo(cellSize * (i + 1), cellSize * this.boardSize);
            ctx.stroke();

            // 가로선
            ctx.beginPath();
            ctx.moveTo(cellSize, cellSize * (i + 1));
            ctx.lineTo(cellSize * this.boardSize, cellSize * (i + 1));
            ctx.stroke();
        }

        // 화점 (star points)
        const starPoints = [
            [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
        ];
        ctx.fillStyle = '#000';
        starPoints.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(cellSize * (x + 1), cellSize * (y + 1), 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 돌 그리기
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
    }

    drawStone(row, col, color) {
        const ctx = this.ctx;
        const cellSize = this.cellSize;
        const x = cellSize * (col + 1);
        const y = cellSize * (row + 1);
        const radius = cellSize * 0.4;

        // 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 돌
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (color === 'black') {
            ctx.fillStyle = '#000';
        } else {
            ctx.fillStyle = '#fff';
        }
        ctx.fill();

        // 테두리
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = color === 'black' ? '#333' : '#ccc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 마지막 수 표시
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        if (lastMove && lastMove.row === row && lastMove.col === col) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = color === 'black' ? '#fff' : '#000';
            ctx.fill();
        }
    }

    setupClickHandler() {
        this.canvas.addEventListener('click', (e) => {
            if (this.isGameOver) return;
            if (this.isAIThinking) return;
            if (this.gameMode === 'pvp' && !this.myTurn) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.round(x / this.cellSize) - 1;
            const row = Math.round(y / this.cellSize) - 1;

            if (this.isValidMove(row, col)) {
                this.makeMove(row, col);
            }
        });
    }

    isValidMove(row, col) {
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
            return false;
        }
        return this.board[row][col] === null;
    }

    async makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, color: this.currentPlayer });
        this.drawBoard();

        if (this.onMove) {
            this.onMove(row, col, this.currentPlayer);
        }

        // 승리 확인
        if (this.checkWin(row, col, this.currentPlayer)) {
            this.endGame(this.currentPlayer);
            return;
        }

        // 무승부 확인
        if (this.isBoardFull()) {
            this.endGame(null);
            return;
        }

        // 다음 플레이어
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';

        // AI 차례
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
            this.isAIThinking = true;
            UI.updateStatus('AI가 생각 중...');

            setTimeout(async () => {
                try {
                    const result = await API.getAIMove(this.board, this.aiColor, this.aiDifficulty);
                    if (result.move) {
                        this.makeMove(result.move.row, result.move.col);
                    }
                } catch (error) {
                    console.error('AI 착수 오류:', error);
                    UI.showError('AI 착수 중 오류가 발생했습니다.');
                } finally {
                    this.isAIThinking = false;
                }
            }, 500);
        } else if (this.gameMode === 'pvp') {
            this.myTurn = !this.myTurn;
        }
    }

    checkWin(row, col, color) {
        const directions = [
            [0, 1],   // 가로
            [1, 0],   // 세로
            [1, 1],   // 대각선 \
            [1, -1]   // 대각선 /
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 양방향 확인
            for (let direction of [-1, 1]) {
                let r = row + dx * direction;
                let c = col + dy * direction;

                while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
                    if (this.board[r][c] === color) {
                        count++;
                        r += dx * direction;
                        c += dy * direction;
                    } else {
                        break;
                    }
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    isBoardFull() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    endGame(winner) {
        this.isGameOver = true;
        const gameDuration = Math.floor((Date.now() - this.gameStartTime) / 1000);

        if (this.onGameEnd) {
            this.onGameEnd(winner, this.moveHistory.length, gameDuration);
        }

        if (winner) {
            UI.updateStatus(`${winner === 'black' ? '흑' : '백'}돌 승리!`);
        } else {
            UI.updateStatus('무승부!');
        }
    }

    loadGameState(boardState, currentPlayer, moveHistory) {
        this.board = boardState;
        this.currentPlayer = currentPlayer;
        this.moveHistory = moveHistory || [];
        this.isGameOver = false;
        this.drawBoard();
    }

    reset() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = 'black';
        this.isGameOver = false;
        this.moveHistory = [];
        this.isAIThinking = false;
        this.gameStartTime = Date.now();
        this.drawBoard();
    }
}
