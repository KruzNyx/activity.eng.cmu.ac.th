-- =========================
-- DROP OLD DATABASE
-- =========================
DROP DATABASE IF EXISTS sd_calendar;

-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE sd_calendar
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE sd_calendar;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  cmu_mail VARCHAR(100) UNIQUE NOT NULL,
  cmu_password VARCHAR(255) NOT NULL,

  role ENUM('admin','sub-admin','user') DEFAULT 'user',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- ACTIVITY GROUPS (SMO / SD / PSYCHO)
-- =========================
CREATE TABLE activity_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_code ENUM('SMO','SD','PSYCHO') NOT NULL UNIQUE,
  group_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- =========================
-- USER ↔ GROUP (สมาชิกอยู่กลุ่มไหน)
-- =========================
CREATE TABLE user_activity_groups (
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES activity_groups(group_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- ACTIVITIES (หัวใจระบบปฏิทิน)
-- =========================
CREATE TABLE activities (
  activity_id INT AUTO_INCREMENT PRIMARY KEY,

  activity_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),

  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,

  activity_type ENUM('SMO','SD','PSYCHO') NOT NULL,

  psycho_case_type ENUM(
    'IN_FACULTY',
    'OUT_FACULTY',
    'ACTIVITY'
  ) NULL,

  show_on_main_calendar BOOLEAN DEFAULT TRUE,
  show_on_psycho_calendar BOOLEAN DEFAULT FALSE,

  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- RESPONSIBLE PERSONS
-- =========================
CREATE TABLE activity_responsible (
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (activity_id, user_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- MASTER DATA
-- =========================
INSERT INTO activity_groups (group_code, group_name) VALUES
('SMO','สโมสรนักศึกษา'),
('SD','ฝ่ายพัฒนานักศึกษา'),
('PSYCHO','นักจิตวิทยา');

-- =========================
-- USERS SEED
-- =========================
INSERT INTO users (username, cmu_mail, cmu_password, role) VALUES
('พี่แอน', 'ann@cmu.ac.th', 'password123', 'sub-admin'),
('พี่นาย', 'nai@cmu.ac.th', 'password123', 'sub-admin'),
('พี่บี', 'bee@cmu.ac.th', 'password123', 'sub-admin'),
('พี่เน็ต', 'net@cmu.ac.th', 'password123', 'sub-admin'),
('พี่ป๊อบ', 'pop@cmu.ac.th', 'password123', 'sub-admin'),
('พี่น้ำขิง', 'namkhing@cmu.ac.th', 'password123', 'sub-admin'),
('พี่ไข่หวาน', 'kaiwan@cmu.ac.th', 'password123', 'admin');

-- =========================
-- SD MEMBERS
-- =========================
INSERT INTO user_activity_groups (user_id, group_id)
SELECT u.user_id, g.group_id
FROM users u
JOIN activity_groups g ON g.group_code = 'SD'
WHERE u.username IN ('พี่แอน','พี่นาย','พี่บี','พี่เน็ต','พี่ไข่หวาน');

-- =========================
-- PSYCHO MEMBERS
-- =========================
INSERT INTO user_activity_groups (user_id, group_id)
SELECT u.user_id, g.group_id
FROM users u
JOIN activity_groups g ON g.group_code = 'PSYCHO'
WHERE u.username IN ('พี่ป๊อบ','พี่น้ำขิง');
