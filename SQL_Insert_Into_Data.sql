INSERT INTO activity_groups (group_code, group_name) VALUES
('SMO','สโมสรนักศึกษา'),
('SD','ฝ่ายพัฒนานักศึกษา'),
('PSYCHO','นักจิตวิทยา');

INSERT INTO users (username, cmu_mail, cmu_password, role) VALUES
('พี่แอน', 'ann@cmu.ac.th', 'password123', 'sub-admin'),
('พี่นาย', 'nai@cmu.ac.th', 'password123', 'sub-admin'),
('พี่บี', 'bee@cmu.ac.th', 'password123', 'sub-admin'),
('พี่เน็ต', 'net@cmu.ac.th', 'password123', 'sub-admin'),
('พี่ป๊อบ', 'pop@cmu.ac.th', 'password123', 'sub-admin'),
('พี่น้ำขิง', 'namkhing@cmu.ac.th', 'password123', 'sub-admin'),
('พี่ไข่หวาน', 'kaiwan@cmu.ac.th', 'password123', 'admin');


INSERT INTO user_activity_groups (user_id, group_id)
SELECT user_id, 2
FROM users
WHERE username IN ('พี่แอน','พี่นาย','พี่บี','พี่เน็ต','พี่ไข่หวาน');