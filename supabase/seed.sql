-- noqa: disable=references.special_chars,convention.quoted_literals
INSERT INTO "traits" ("id", "created_at", "updated_at", "name", "description", "slug", "user_id", "color") VALUES
(DEFAULT, NOW(), NOW(), 'Good', 'Habits that improve life quality', 'good', NULL, '#2AF004'),
(DEFAULT, NOW(), NOW(), 'Neutral', 'Habits that neither improve nor decrease life quality', 'neutral', NULL, '#94A3B8'),
(DEFAULT, NOW(), NOW(), 'Bad', 'Habits that decrease life quality', 'bad', NULL, '#F00625');
