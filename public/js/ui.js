// UI 관리 클래스

class UI {
    static showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById(screenId).style.display = 'block';
    }

    static showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    static clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    static updateStatus(message) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    static updateTurn(player) {
        const turnElement = document.getElementById('current-turn');
        if (turnElement) {
            turnElement.textContent = `${player === 'black' ? '흑' : '백'}돌 차례`;
        }
    }

    static showModal(title, content, buttons) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        let html = `<h2>${title}</h2><p>${content}</p>`;

        if (buttons && buttons.length > 0) {
            html += '<div class="modal-buttons">';
            buttons.forEach(btn => {
                html += `<button class="modal-btn ${btn.className}" onclick="${btn.onClick}">${btn.text}</button>`;
            });
            html += '</div>';
        }

        modalBody.innerHTML = html;
        modal.style.display = 'block';
    }

    static hideModal() {
        document.getElementById('modal').style.display = 'none';
    }

    static showSaveGameDialog(onSave) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <h2>게임 저장</h2>
            <input type="text" id="save-game-name" placeholder="저장할 게임 이름" style="width: 100%; padding: 10px; margin: 20px 0; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" id="confirm-save-btn">저장</button>
                <button class="modal-btn modal-btn-secondary" id="cancel-save-btn">취소</button>
            </div>
        `;

        modal.style.display = 'block';

        document.getElementById('confirm-save-btn').onclick = () => {
            const gameName = document.getElementById('save-game-name').value.trim();
            if (gameName) {
                onSave(gameName);
                this.hideModal();
            } else {
                alert('게임 이름을 입력하세요.');
            }
        };

        document.getElementById('cancel-save-btn').onclick = () => {
            this.hideModal();
        };
    }

    static renderSavedGames(games) {
        const container = document.getElementById('saved-games-list');

        if (games.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">저장된 게임이 없습니다.</p>';
            return;
        }

        let html = '';
        games.forEach(game => {
            const date = new Date(game.updated_at).toLocaleString('ko-KR');
            const modeText = game.game_mode === 'ai' ? `AI 대전 (${game.ai_difficulty})` : '1:1 대전';

            html += `
                <div class="saved-game-item">
                    <div class="game-item-info">
                        <h4>${game.game_name}</h4>
                        <p>${modeText} | ${date}</p>
                    </div>
                    <div class="game-item-actions">
                        <button class="game-item-btn load-btn" onclick="loadSavedGame(${game.id})">불러오기</button>
                        <button class="game-item-btn delete-btn" onclick="deleteSavedGame(${game.id})">삭제</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    static renderStats(stats) {
        const container = document.getElementById('stats-content');

        const statsData = [
            { label: '총 게임', value: stats.total_games },
            { label: '승리', value: stats.wins },
            { label: '패배', value: stats.losses },
            { label: '무승부', value: stats.draws },
            { label: '승률', value: `${stats.win_rate}%` },
            { label: 'AI 초급 승', value: stats.ai_easy_wins },
            { label: 'AI 중급 승', value: stats.ai_medium_wins },
            { label: 'AI 고급 승', value: stats.ai_hard_wins },
            { label: '1:1 승', value: stats.pvp_wins }
        ];

        let html = '';
        statsData.forEach(stat => {
            html += `
                <div class="stat-card">
                    <h3>${stat.value}</h3>
                    <p>${stat.label}</p>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    static renderRecentGames(games) {
        const container = document.getElementById('recent-games-list');

        if (games.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">최근 게임 기록이 없습니다.</p>';
            return;
        }

        let html = '';
        games.forEach(game => {
            const date = new Date(game.played_at).toLocaleString('ko-KR');
            const modeText = game.game_mode === 'ai' ? `AI (${game.ai_difficulty})` : `vs ${game.player2_name || '상대'}`;
            const resultText = game.result === 'win' ? '승리' : (game.result === 'lose' ? '패배' : '무승부');
            const resultColor = game.result === 'win' ? '#27ae60' : (game.result === 'lose' ? '#e74c3c' : '#95a5a6');

            html += `
                <div class="recent-game-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${modeText}</strong>
                            <span style="color: ${resultColor}; margin-left: 10px; font-weight: bold;">${resultText}</span>
                        </div>
                        <div style="color: #666; font-size: 0.9em;">
                            ${game.total_moves}수 | ${date}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    static renderLeaderboard(leaderboard) {
        const container = document.getElementById('leaderboard-content');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">리더보드 데이터가 없습니다.</p>';
            return;
        }

        let html = '';
        leaderboard.forEach((entry, index) => {
            const rankEmoji = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));

            html += `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${rankEmoji} ${index + 1}</div>
                    <div class="leaderboard-info">
                        <strong>${entry.username}</strong>
                    </div>
                    <div class="leaderboard-stats">
                        <div>승: ${entry.wins} | 패: ${entry.losses}</div>
                        <div>승률: ${entry.win_rate}%</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
}

// 모달 닫기
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
