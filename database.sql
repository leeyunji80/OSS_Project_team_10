-- 오목 게임 데이터베이스 스키마

CREATE DATABASE IF NOT EXISTS omoku_game;
USE omoku_game;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
);

-- 게임 저장 테이블
CREATE TABLE IF NOT EXISTS saved_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    board_state JSON NOT NULL,
    current_player ENUM('black', 'white') NOT NULL,
    game_mode ENUM('ai', 'pvp') NOT NULL,
    ai_difficulty ENUM('easy', 'medium', 'hard') DEFAULT NULL,
    move_history JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- 게임 전적 테이블
CREATE TABLE IF NOT EXISTS game_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT DEFAULT NULL,
    game_mode ENUM('ai', 'pvp') NOT NULL,
    ai_difficulty ENUM('easy', 'medium', 'hard') DEFAULT NULL,
    winner_id INT DEFAULT NULL,
    result ENUM('win', 'lose', 'draw') NOT NULL,
    total_moves INT NOT NULL,
    game_duration INT,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_player1 (player1_id),
    INDEX idx_player2 (player2_id)
);

-- 통계 테이블 (캐시용)
CREATE TABLE IF NOT EXISTS user_statistics (
    user_id INT PRIMARY KEY,
    total_games INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    ai_easy_wins INT DEFAULT 0,
    ai_medium_wins INT DEFAULT 0,
    ai_hard_wins INT DEFAULT 0,
    pvp_wins INT DEFAULT 0,
    average_moves DECIMAL(10, 2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
