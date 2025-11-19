// 오목 게임 로직

const BOARD_SIZE = 15;
const DIRECTIONS = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 \
    [1, -1]   // 대각선 /
];

// 빈 보드 생성
function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

// 유효한 착수인지 확인
function isValidMove(board, row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return false;
    }
    return board[row][col] === null;
}

// 승리 확인
function checkWin(board, row, col, color) {
    for (const [dx, dy] of DIRECTIONS) {
        let count = 1;

        // 양방향으로 확인
        for (let direction of [-1, 1]) {
            let r = row + dx * direction;
            let c = col + dy * direction;

            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                if (board[r][c] === color) {
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

// 보드가 가득 찼는지 확인
function isBoardFull(board) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}

// 특정 위치의 점수 계산 (휴리스틱)
function evaluatePosition(board, row, col, color) {
    let score = 0;
    const opponent = color === 'black' ? 'white' : 'black';

    for (const [dx, dy] of DIRECTIONS) {
        let myCount = 0;
        let opponentCount = 0;
        let empty = 0;

        // 양방향으로 확인
        for (let direction of [-1, 1]) {
            let r = row + dx * direction;
            let c = col + dy * direction;
            let consecutiveCount = 0;

            for (let i = 0; i < 4; i++) {
                if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;

                if (board[r][c] === color) {
                    consecutiveCount++;
                } else if (board[r][c] === null) {
                    empty++;
                    break;
                } else {
                    break;
                }

                r += dx * direction;
                c += dy * direction;
            }

            myCount += consecutiveCount;
        }

        // 점수 계산
        if (myCount >= 4) score += 100000; // 5목 완성
        else if (myCount === 3 && empty >= 1) score += 10000; // 4목
        else if (myCount === 2 && empty >= 2) score += 1000; // 3목
        else if (myCount === 1 && empty >= 3) score += 100; // 2목
    }

    // 중앙에 가까울수록 가산점
    const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
    score += (14 - centerDistance) * 10;

    return score;
}

// 모든 가능한 착수 위치 가져오기 (근처 돌 중심으로)
function getPossibleMoves(board, maxMoves = 20) {
    const moves = [];
    const scored = [];

    // 이미 놓인 돌 주변만 탐색 (최적화)
    const checked = new Set();

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== null) {
                // 주변 8방향 탐색
                for (let di = -2; di <= 2; di++) {
                    for (let dj = -2; dj <= 2; dj++) {
                        const ni = i + di;
                        const nj = j + dj;
                        const key = `${ni},${nj}`;

                        if (!checked.has(key) && isValidMove(board, ni, nj)) {
                            checked.add(key);
                            const score = evaluatePosition(board, ni, nj, 'black') +
                                        evaluatePosition(board, ni, nj, 'white');
                            scored.push({ row: ni, col: nj, score });
                        }
                    }
                }
            }
        }
    }

    // 첫 수인 경우 중앙 반환
    if (scored.length === 0) {
        return [{ row: 7, col: 7 }];
    }

    // 점수 순으로 정렬하고 상위 N개만 반환
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxMoves).map(m => ({ row: m.row, col: m.col }));
}

// 보드 평가 함수
function evaluateBoard(board, color) {
    let score = 0;
    const opponent = color === 'black' ? 'white' : 'black';

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === color) {
                score += evaluatePosition(board, i, j, color);
            } else if (board[i][j] === opponent) {
                score -= evaluatePosition(board, i, j, opponent);
            }
        }
    }

    return score;
}

module.exports = {
    BOARD_SIZE,
    createEmptyBoard,
    isValidMove,
    checkWin,
    isBoardFull,
    evaluatePosition,
    evaluateBoard,
    getPossibleMoves
};
