INSERT INTO traits (id, created_at, updated_at, name, description, slug, user_id, color) VALUES
(DEFAULT, NOW(), NOW(), 'Bad', 'Habits that decrease life quality', 'bad', NULL, 'red'),
(DEFAULT, NOW(), NOW(), 'Neutral', 'Habits that neither improve nor decrease life quality', 'neutral', NULL, 'gray'),
(DEFAULT, NOW(), NOW(), 'Good', 'Habits that improve life quality', 'good', NULL, 'green');
