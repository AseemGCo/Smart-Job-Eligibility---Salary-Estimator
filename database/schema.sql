-- ============================================================
--  TalentScope — MySQL Schema
--  Smart Job Eligibility & Salary Estimator
--  MySQL 8.0+
-- ============================================================

-- Create the database (idempotent) and select it.
CREATE DATABASE IF NOT EXISTS `talentscope`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `talentscope`;

-- ------------------------------------------------------------
--  users
--  One row per registered account (regular user or admin).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100)    NOT NULL,
  `email`         VARCHAR(190)    NOT NULL,
  `password_hash` VARCHAR(255)    NOT NULL,
  `role`          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  candidates
--  One row per evaluated candidate. Belongs to a user.
--  Computed fields (eligibility, salary, etc.) are written by
--  the backend eligibility engine.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `candidates` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`          BIGINT UNSIGNED NOT NULL,
  `candidate_name`   VARCHAR(120)    NOT NULL,
  `age`              TINYINT UNSIGNED NOT NULL,
  `education`        ENUM('Graduate', 'Postgraduate', 'Non-IT Background') NOT NULL,
  `skill_score`      TINYINT UNSIGNED NOT NULL,           -- 0..100
  `projects`         SMALLINT UNSIGNED NOT NULL,          -- 0..1000
  `relocate`         ENUM('Yes', 'No') NOT NULL,
  `eligibility`      ENUM('Eligible', 'Not Eligible') NOT NULL,
  `priority_status`  TINYINT(1)      NOT NULL DEFAULT 0,  -- boolean
  `confidence_level` ENUM('High', 'Medium', 'Low') NOT NULL,
  `salary_min`       DECIMAL(5,1)    NOT NULL DEFAULT 0,  -- LPA
  `salary_max`       DECIMAL(5,1)    NOT NULL DEFAULT 0,  -- LPA
  `ranking_score`    DECIMAL(6,1)    NOT NULL DEFAULT 0,
  `suggestions`      JSON            NULL,                -- array of strings
  `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_candidates_user` (`user_id`),
  KEY `idx_candidates_eligibility` (`eligibility`),
  KEY `idx_candidates_priority` (`priority_status`),
  KEY `idx_candidates_ranking` (`ranking_score`),
  CONSTRAINT `fk_candidates_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
