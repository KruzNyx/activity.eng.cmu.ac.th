create	database	sd_calendar
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
USE sd_calendar;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  cmu_mail VARCHAR(100) UNIQUE NOT NULL,
  cmu_password VARCHAR(255) NOT NULL,
  role ENUM('admin','sub-admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE activity_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_code ENUM('SMO','SD','PSYCHO') NOT NULL,
  group_name VARCHAR(100) NOT NULL
);



CREATE TABLE user_activity_groups (
  user_id INT,
  group_id INT,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (group_id) REFERENCES activity_groups(group_id)
);

CREATE TABLE activities (
  activity_id INT AUTO_INCREMENT PRIMARY KEY,

  activity_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),

  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,

  activity_type ENUM(
    'SMO',
    'SD',
    'PSYCHO'
  ) NOT NULL,

  psycho_case_type ENUM(
    'IN_FACULTY',
    'OUT_FACULTY',
    'ACTIVITY'
  ) NULL,

  show_on_main_calendar BOOLEAN DEFAULT TRUE,
  show_on_psycho_calendar BOOLEAN DEFAULT FALSE,

  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;


CREATE TABLE activity_responsible (
  activity_id INT,
  user_id INT,
  is_main BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (activity_id, user_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

