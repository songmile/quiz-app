CREATE TABLE IF NOT EXISTS question_bank (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bank_code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(1024) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_code VARCHAR(64) NOT NULL UNIQUE,
  bank_id BIGINT NULL,
  type VARCHAR(32) NOT NULL,
  text TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_question_bank FOREIGN KEY (bank_id) REFERENCES question_bank(id)
);

CREATE TABLE IF NOT EXISTS question_option (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_key VARCHAR(8) NOT NULL,
  option_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_question_option_question FOREIGN KEY (question_id) REFERENCES question(id),
  UNIQUE KEY uk_question_option_key (question_id, option_key)
);

CREATE TABLE IF NOT EXISTS question_tag (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_tag_rel (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  CONSTRAINT fk_tag_rel_question FOREIGN KEY (question_id) REFERENCES question(id),
  CONSTRAINT fk_tag_rel_tag FOREIGN KEY (tag_id) REFERENCES question_tag(id),
  UNIQUE KEY uk_question_tag_rel (question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS user_answer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  session_type VARCHAR(32) NOT NULL,
  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_answer_question FOREIGN KEY (question_id) REFERENCES question(id),
  KEY idx_user_answer_question_time (question_id, answered_at)
);

CREATE TABLE IF NOT EXISTS review_card (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  ease_factor DECIMAL(5,2) NOT NULL DEFAULT 2.50,
  interval_days INT NOT NULL DEFAULT 0,
  repetitions INT NOT NULL DEFAULT 0,
  next_review_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_review_at DATETIME NULL,
  total_reviews INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_review_card_question FOREIGN KEY (question_id) REFERENCES question(id),
  KEY idx_review_due (next_review_at)
);

CREATE TABLE IF NOT EXISTS study_session (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mode VARCHAR(32) NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statistics_snapshot (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  total_answered INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  study_minutes INT NOT NULL DEFAULT 0,
  wrong_question_count INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wrong_question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  first_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wrong_question_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS view_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  view_key VARCHAR(32) NOT NULL UNIQUE,
  current_index INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS note (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_note_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS bookmark (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookmark_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS study_streak (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE NULL,
  daily_goal INT NOT NULL DEFAULT 10,
  today_progress INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_streak_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  streak_id BIGINT NOT NULL,
  stat_date DATE NOT NULL,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_streak_log_streak FOREIGN KEY (streak_id) REFERENCES study_streak(id),
  UNIQUE KEY uk_streak_date (streak_id, stat_date)
);

CREATE TABLE IF NOT EXISTS app_setting (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(64) NOT NULL UNIQUE,
  setting_value_json JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  api_url VARCHAR(255) NOT NULL,
  model VARCHAR(128) NOT NULL,
  api_key_masked VARCHAR(128) NULL,
  api_key_cipher TEXT NULL,
  chunk_size INT NOT NULL DEFAULT 1000,
  max_tokens INT NOT NULL DEFAULT 4096,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_explanation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  api_config_id BIGINT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_explain_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS ai_error_analysis (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  user_answer TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  api_config_id BIGINT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_error_question FOREIGN KEY (question_id) REFERENCES question(id),
  UNIQUE KEY uk_ai_error_unique (question_id, user_answer(255))
);

CREATE TABLE IF NOT EXISTS ai_variant_question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  variant_payload_json JSON NOT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_variant_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS ai_knowledge_tree (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  tree_payload_json JSON NOT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_tree_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS ai_design_process (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL UNIQUE,
  process_payload_json JSON NOT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_process_question FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS import_job (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_no VARCHAR(64) NOT NULL UNIQUE,
  mode VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  total_chunks INT NOT NULL DEFAULT 0,
  processed_chunks INT NOT NULL DEFAULT 0,
  success_chunks INT NOT NULL DEFAULT 0,
  failed_chunks INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME NULL,
  error_message TEXT NULL
);

CREATE TABLE IF NOT EXISTS import_job_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id BIGINT NOT NULL,
  chunk_no INT NOT NULL,
  status VARCHAR(16) NOT NULL,
  result_json JSON NULL,
  error_message TEXT NULL,
  CONSTRAINT fk_import_item_job FOREIGN KEY (job_id) REFERENCES import_job(id),
  UNIQUE KEY uk_import_job_chunk (job_id, chunk_no)
);

CREATE TABLE IF NOT EXISTS backup_job (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_no VARCHAR(64) NOT NULL UNIQUE,
  kind VARCHAR(32) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
