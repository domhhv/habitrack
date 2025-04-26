-- noqa: disable=references.special_chars,convention.quoted_literals
INSERT INTO "traits" ("id", "created_at", "updated_at", "name", "description", "user_id", "color") VALUES
(DEFAULT, NOW(), NOW(), 'Good', 'Habits that improve life quality', NULL, '#2AF004'),
(DEFAULT, NOW(), NOW(), 'Neutral', 'Habits that neither improve nor decrease life quality', NULL, '#94A3B8'),
(DEFAULT, NOW(), NOW(), 'Bad', 'Habits that decrease life quality', NULL, '#F00625');

INSERT INTO
"auth"."users" (
    "instance_id",
    "id",
    "aud",
    "role",
    "email",
    "encrypted_password",
    "email_confirmed_at",
    "recovery_sent_at",
    "last_sign_in_at",
    "raw_app_meta_data",
    "raw_user_meta_data",
    "created_at",
    "updated_at",
    "confirmation_token",
    "email_change",
    "email_change_token_new",
    "recovery_token"
) (
    SELECT
        '00000000-0000-0000-0000-000000000000' AS "instance_id",
        GEN_RANDOM_UUID() AS "id",
        'authenticated' AS "aud",
        'authenticated' AS "role",
        'user' || (ROW_NUMBER() OVER ()) || '@gmail.com' AS "email",
        CRYPT('123456', GEN_SALT('bf')) AS "encrypted_password",
        NOW() AS "email_confirmed_at",
        NOW() AS "recovery_sent_at",
        NOW() AS "last_sign_in_at",
        '{"provider":"email","providers":["email"]}' AS "raw_app_meta_data",
        '{}' AS "raw_user_meta_data",
        NOW() AS "created_at",
        NOW() AS "updated_at",
        '' AS "confirmation_token",
        '' AS "email_change",
        '' AS "email_change_token_new",
        '' AS "recovery_token"
    FROM
        GENERATE_SERIES(1, 10)
);

INSERT INTO
"auth"."identities" (
    "id",
    "user_id",
    "provider_id",
    "identity_data",
    "provider",
    "last_sign_in_at",
    "created_at",
    "updated_at"
) (
    SELECT
        GEN_RANDOM_UUID() AS "id",
        "id" AS "user_id",
        "id" AS "provider_id",
        FORMAT('{"sub":"%s","email":"%s"}', "id"::text, "email")::jsonb AS "identity_data",
        'email' AS "provider",
        NOW() AS "last_sign_in_at",
        NOW() AS "created_at",
        NOW() AS "updated_at"
    FROM
        "auth"."users"
);
