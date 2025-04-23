-- noqa: disable=references.special_chars,convention.quoted_literals
INSERT INTO "traits" ("id", "created_at", "updated_at", "name", "description", "user_id", "color") VALUES
(DEFAULT, NOW(), NOW(), 'Good', 'Habits that improve life quality', NULL, '#2AF004'),
(DEFAULT, NOW(), NOW(), 'Neutral', 'Habits that neither improve nor decrease life quality', NULL, '#94A3B8'),
(DEFAULT, NOW(), NOW(), 'Bad', 'Habits that decrease life quality', NULL, '#F00625');
